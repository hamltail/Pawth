module UsersHelper
  def avatar_for(user, size: 80, css: '')
    avatar = user&.profile&.avatar
    alt_text = user&.username ? t('helpers.avatar.user', username: user.username) : t('helpers.avatar.default')

    image_tag(
      avatar&.attached? ? avatar : 'default_avatar.png',
      width: size,
      height: size,
      class: "aspect-square shrink-0 rounded-full object-cover #{css}",
      style: "width: #{size}px; height: #{size}px;",
      alt: alt_text
    )
  end
end
