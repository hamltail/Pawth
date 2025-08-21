Rails.application.routes.draw do
  devise_for :users, controllers: {
    registrations: 'users/registrations'
  }

  devise_scope :user do
    root 'devise/sessions#new'
  end

  resources :daily_posts, only: %i[ index new create edit update destroy ]

  get '/:username', to: 'activities#show', as: :activity
end
