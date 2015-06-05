(($) ->
  $.fn.extend
    gphoto: (options) ->
      settings =
        provider: 'fotorama'

      settings = $.extend settings, options
      provider = $.fn.gphoto.provider

      # body script
      return @.filter("[href ^= https\\:\\/\\/plus\\.google\\.com\\/photos]").each () ->
        $link = $(@)
        url = new URI($link.attr('href'))
        userId = url.segment(1)
        albumId = url.segment(3)
        $.getJSON(
          "https://picasaweb.google.com/data/feed/api/user/#{userId}/albumid/#{albumId}?kind=photo&access=public&alt=json-in-script&callback=?",
          (data, status) ->
            images = data.feed.entry.map (image) ->
              url =  new URI(image.content.src)
              imageUrl = "#{url.protocol()}://#{url.host()}#{url.directory()}"
              provider[settings.provider].filter.call(settings, imageUrl, image)
            provider[settings.provider].insert.call(settings, $link, images)
            return
        )
# init default providers
# todo-me need rest after refactor
  $.fn.gphoto.provider =
    fotorama:
      filter: (imageUrl, image) ->
        img: "#{imageUrl}w0/"
        thumb: "#{imageUrl}w64-h64/"
      insert: ($link, images) ->
        $fotorama = $('<div class="fotorama"></div>')
        $link.replaceWith($fotorama)
        $fotorama.fotorama $.extend data: images, @
        return
    ggrid:
      filter: (imageUrl, image) ->
        imageUrl: imageUrl
        data: image
      insert: ($link, images) ->
        $ggrid = $('<div class="ggrid"></div>')
        options = data: images
        if $link.attr("title")?
          options['template'] =  $link.attr("title")
        $link.replaceWith($ggrid)
        $ggrid.ggrid $.extend options, @
        $ggrid.find('a').fluidbox()
        return
) jQuery
