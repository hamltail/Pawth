module UsersHelper
  def avatar_for(user, size: 80, css: '')
    if user&.avatar&.attached?
      image_tag user.avatar,
                width: size, height: size,
                class: "rounded-full object-cover #{css}",
                alt: "#{user.username}のアバター"
    else
      image_tag 'default_avatar.png',
                size: "#{size}x#{size}",
                class: "rounded-full object-cover #{css}",
                alt: 'デフォルトアバター'
    end
  end
end
