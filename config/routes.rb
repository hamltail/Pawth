Rails.application.routes.draw do
  devise_for :users, controllers: {
    registrations: 'users/registrations'
  }

  devise_scope :user do
    root 'devise/sessions#new'
  end

  resource :profile, only: %i[edit update]
  resources :daily_posts, only: %i[index new create edit update destroy]

  mount LetterOpenerWeb::Engine, at: '/letter_opener' if Rails.env.development?

  get '/:username', to: 'activities#show', as: :activity
end
