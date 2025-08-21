# http://localhost:3000/rails/mailers/user_mailer
class UserMailerPreview < ActionMailer::Preview
  def confirmation_instructions
    user = sample_user
    Devise::Mailer.confirmation_instructions(user, 'preview-token')
  end

  def reset_password_instructions
    user = sample_user
    Devise::Mailer.reset_password_instructions(user, 'preview-token')
  end

  def email_changed
    user = sample_user
    Devise::Mailer.email_changed(user)
  end

  def password_change
    user = sample_user
    Devise::Mailer.password_change(user)
  end

  private
    def sample_user
      User.first || User.new(email: 'preview@example.com', username: 'preview-user')
    end
end
