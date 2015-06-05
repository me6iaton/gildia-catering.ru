(($) ->
  $.fn.extend
    ggrid: (options) ->
      $this = @

      settings =
        columns: 4
        maxWidth: 1170
        padding: 5

      settings = $.extend settings, options

      methods =
        makeRow: (images) ->
          $out = $("<div data-paragraph-count='#{images.length}' class='row'></div>")
          constanta = 1/images.reduceRight (one, two) ->
            (if one.data then 1/(Number(one.data.gphoto$height.$t)/Number(one.data.gphoto$width.$t)) else one) +	1/(Number(two.data.gphoto$height.$t)/Number(two.data.gphoto$width.$t)) if images.length != 1
          for image in images
            if images.length != 1
              width = constanta/(Number(image.data.gphoto$height.$t)/Number(image.data.gphoto$width.$t)) * 100
              maxWidth = Math.round( settings.maxWidth/100 * width)
            else
              width = 100
              maxWidth = 0
            $out.append """
              <div class='col' style='width: #{width}%;'>
                <a href="#{image.imageUrl}/w0/">
                  <img class='img-responsive' src='#{image.imageUrl}/w#{maxWidth}/' alt='' />
                </a>
              </div>
              """
          $this.append $out
          return

      images =  options.data
      template = options.template.split('-') if options.template?
      chunk; i = 0; iter = 0
      while i < images.length
        if template?[iter]
          #add template layout support in title attr
          chunk = Number(template[iter])
          iter++
        else
          #do not show 1 immage to end gride
          chunk = if images.length - (i + settings.columns) == 1 then settings.columns - 1 else settings.columns
        methods.makeRow images.slice(i,i+chunk)
        i+=chunk
      # body script
      return @.each () ->
        console.log('ggrid')
        return
) jQuery
