Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      namespace :admin do
        resources :contents, only: [:show, :update]
        resources :images, only: [:create, :index]
      end
      
      resources :works, only: [:index, :show]
      resources :blogs, param: :slug, only: [:index, :show]
      resources :donations, only: [:create]
      # Add other resources as needed
    end
  end

  # Health check
  get '/up', to: proc { [200, {}, ['OK']] }
end
