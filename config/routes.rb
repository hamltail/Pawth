Rails.application.routes.draw do
  devise_for :users
  get "/:username", to: "profiles#show", as: :profile
end
