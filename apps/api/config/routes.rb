Rails.application.routes.draw do
  # Root endpoint - API info
  root to: proc { [200, { 'Content-Type' => 'application/json' }, [{ 
    api: 'Furukawa Archive OS API',
    version: 'v1',
    status: 'running',
    endpoints: {
      works: '/api/v1/works',
      blogs: '/api/v1/blogs',
      donations: '/api/v1/donations'
    }
  }.to_json]] }

  namespace :api do
    namespace :v1 do
      namespace :admin do
        resources :contents, only: [:show, :update]
        resources :images, only: [:create, :index]
        resources :blogs, param: :slug, only: [:index, :show, :create, :update, :destroy]
        post 'sync/protopedia', to: 'sync#protopedia'
        
        # Temporary public endpoint for initial setup
        get 'sync/force', to: 'sync#force_sync'
      end
      
      resources :works, only: [:index, :show]
      resources :blogs, param: :slug, only: [:index, :show]
      resources :donations, only: [:create, :index]
      resources :questions, only: [:create, :index]
      post 'webhook/bmc', to: 'donations#webhook'
    end
  end

  # Health check
  get '/up', to: proc { [200, {}, ['OK']] }
  get '/api/v1/up', to: proc { [200, {}, ['OK']] }

  # WebSocket endpoint
  mount ActionCable.server => '/cable'
end
