const HETZNER_API = 'https://api.hetzner.cloud/v1'

interface HetznerServer {
  id: number
  name: string
  public_net: {
    ipv4: { ip: string }
    ipv6: { ip: string }
  }
  status: string
}

interface CreateServerOptions {
  name: string
  server_type: string
  location: string
  image: string
  ssh_keys?: string[]
  user_data?: string
}

class HetznerClient {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${HETZNER_API}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async listServers(): Promise<HetznerServer[]> {
    const data = await this.fetch('/servers')
    return data.servers
  }

  async createServer(options: CreateServerOptions): Promise<HetznerServer> {
    const data = await this.fetch('/servers', {
      method: 'POST',
      body: JSON.stringify({
        name: options.name,
        server_type: options.server_type,
        location: options.location,
        image: options.image,
        ssh_keys: options.ssh_keys,
        user_data: options.user_data,
      }),
    })
    return data.server
  }

  async deleteServer(id: number): Promise<void> {
    await this.fetch(`/servers/${id}`, { method: 'DELETE' })
  }

  async getServer(id: number): Promise<HetznerServer> {
    const data = await this.fetch(`/servers/${id}`)
    return data.server
  }
}

export function createHetznerClient() {
  const token = process.env.HETZNER_API_TOKEN
  if (!token) {
    throw new Error('HETZNER_API_TOKEN is not set')
  }
  return new HetznerClient(token)
}

// Cloud-init script to set up Docker + OpenClaw
export function getCloudInitScript(config: {
  gateway_token: string
  telegram_token?: string
  use_ollama: boolean
  model: string
}) {
  return `#cloud-config
package_update: true
package_upgrade: true

packages:
  - docker.io
  - docker-compose

runcmd:
  - systemctl enable docker
  - systemctl start docker
  
  # Create OpenClaw directory
  - mkdir -p /opt/openclaw
  
  # Create docker-compose.yml
  - |
    cat > /opt/openclaw/docker-compose.yml << 'EOF'
    version: '3.8'
    services:
      openclaw:
        image: openclaw/openclaw:latest
        container_name: openclaw
        restart: always
        ports:
          - "18792:18792"
        environment:
          - GATEWAY_TOKEN=${config.gateway_token}
          ${config.telegram_token ? `- TELEGRAM_BOT_TOKEN=${config.telegram_token}` : ''}
          ${config.use_ollama ? '- OLLAMA_HOST=http://ollama:11434' : ''}
          - DEFAULT_MODEL=${config.use_ollama ? 'ollama/llama3.2' : config.model}
        ${config.use_ollama ? 'depends_on:\n          - ollama' : ''}
      
      ${
        config.use_ollama
          ? `
      ollama:
        image: ollama/ollama:latest
        container_name: ollama
        restart: always
        volumes:
          - ollama_data:/root/.ollama
        command: serve
      `
          : ''
      }
    
    volumes:
      ${config.use_ollama ? 'ollama_data:' : ''}
    EOF
  
  # Pull and start containers
  - cd /opt/openclaw && docker-compose pull
  - cd /opt/openclaw && docker-compose up -d
  
  ${config.use_ollama ? "# Pull Llama model\n  - docker exec ollama ollama pull llama3.2:8b" : ''}
`
}
