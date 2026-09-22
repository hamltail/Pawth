module UsersHelper
  def avatar_for(user, size: 80, responsive_size: nil, css: '')
    avatar = user&.profile&.avatar
    alt_text = user&.username ? t('helpers.avatar.user', username: user.username) : t('helpers.avatar.default')

    image_tag(
      avatar&.attached? ? avatar : 'default_avatar.png',
      width: size,
      height: size,
      class: "aspect-square shrink-0 rounded-full object-cover #{css}",
      style: avatar_size_style(size, responsive_size),
      alt: alt_text
    )
  end

  private

  def avatar_size_style(size, responsive_size)
    return "width: #{size}px; height: #{size}px;" unless responsive_size

    "--avatar-size: #{size}px; --avatar-responsive-size: #{responsive_size}px;"
  end
end
