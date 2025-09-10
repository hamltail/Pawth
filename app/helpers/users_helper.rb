module UsersHelper
  def avatar_for(user, size: 80, css: '')
    if user&.profile&.avatar&.attached?
      image_tag user.profile.avatar,
                width: size, height: size,
                class: "rounded-full object-cover #{css}",
                alt: t('helpers.avatar.user', username: user.username)
    else
      image_tag 'default_avatar.png',
                size: "#{size}x#{size}",
                class: "rounded-full object-cover #{css}",
                alt: t('helpers.avatar.default')
    end
  end
end
