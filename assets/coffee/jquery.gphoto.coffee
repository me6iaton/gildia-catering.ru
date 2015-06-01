(($) ->
  $.fn.extend
    gphoto: (options) ->
      settings =
        provider:
          name: 'fotorama'

      settings = $.extend settings, options

      provider =
        fotorama:
          filter: (imageUrl, image) ->
            img: "#{imageUrl}w0/"
            thumb: "#{imageUrl}w64-h64/"
          insert: ($link, images) ->
            $fotorama = $('<div class="fotorama"></div>')
            $link.replaceWith($fotorama)
            $fotorama.fotorama $.extend data: images, settings.provider
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
            $ggrid.ggrid $.extend options, settings.provider
            $ggrid.find('a').fluidbox()
            return

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
              if settings.filter
                settings.filter(imageUrl, image)
              else
                provider[settings.provider.name].filter(imageUrl, image)

            if settings.insert
              settings.insert($link, images)
            else
              provider[settings.provider.name].insert($link, images)
            return
        )
) jQuery
