Rails.application.routes.draw do
  devise_for :users

  devise_scope :user do
    root to: "devise/sessions#new"
  end

  resources :daily_posts, only: [ :index, :new, :create, :show ]
  get "/:username", to: "profiles#show", as: :profile
end
