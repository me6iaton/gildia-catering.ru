(($) ->
  $ ->
    console.log("DOM is ready")
#   menu
    $('.dropdown-full').hover(->
      if (!$(@).hasClass('open'))
        $(@).find('.dropdown-toggle').dropdown('toggle')
    ,->
      if ($(@).hasClass('open'))
        $(@).find('.dropdown-toggle').dropdown('toggle')
    )
#   slider
    TimerInterval = (callback, delay) ->
      timerId = undefined
      remaining = delay
      @pause = ->
        clearTimeout timerId
      @resume = ->
        clearTimeout timerId
        timerId = setInterval(callback, remaining)
      @resume()

    $('#serviceTabs a:first').tab('show')

#    sliderTimer = new TimerInterval((->
#      $('#serviceSlider .icon-right').click()
#    ), $('#serviceSlider').data('sliderTimeout'))

    sliderTimerHover = null
    $('#serviceTabs .tab').hover ->
      clearTimeout(sliderTimerHover) if sliderTimerHover
      sliderTimerHover = setTimeout( () =>
        $(@).tab 'show'
      , $('#serviceSlider').data('sliderTimeoutHover'))

#    $('#serviceTabs .tab, #serviceSlider').hover(
#      ->
#        sliderTimer.pause()
#      ,->
#        sliderTimer.resume()
#    )


    $('#serviceSlider .icon-right').click ->
      $next = $('#serviceTabs .active').next().find('a')
      $next = $('#serviceTabs a:first') if (!$next.length)
      $next.tab 'show'
    $('#serviceSlider .icon-left').click ->
      $next = $('#serviceTabs .active').prev().find('a')
      $next = $('#serviceTabs a:last') if (!$next.length)
      $next.tab 'show'



    transform = (a, b) ->
      # set the stage so ramjet copies the right styles...
      b.classList.remove 'hidden'
      ramjet.transform a, b, done: ->
        # this function is called as soon as the transition completes
        b.classList.remove 'hidden'
        if($(a).hasClass('whyus-intro'))
          $('.whyus').css('min-height', $(b).find('.row').innerHeight() + 20)
        else
          $('.whyus').css('min-height', '')
      # ...then hide the original elements for the duration of the transition
      a.classList.add 'hidden'
      b.classList.add 'hidden'

    $('.whyus-intro').click -> transform(@, @.nextSibling)
    $('.whyus-detail').click -> transform(@, @.previousSibling)

    $('.hypher').hyphenate('ru')

#   gallery
    $('a.swiper-link-gallery').gphoto(
      filter: (imageUrl, image)->
        img: "#{imageUrl}/w1200/"
        thumb: "#{imageUrl}/w300-h300-c/"
      insert: ($link, images)->
        $swiper = $('<div class="swiper-gallery swiper-container"></div>')
        $swiperWrapper = $('<div class="swiper-wrapper"></div>')
        $.each(images, (index, element)->
          $swiperWrapper.append(
            '
            <div class="swiper-slide">
               <a href="'+element.img+'" data-effect="mfp-zoom-in">
                  <img src="'+element.thumb+'" alt=""/>
                </a>
            </div>
            '
          )
        )
        $swiper.append($swiperWrapper)
#        $swiper.append(
#          '
#          <div class="swiper-button-prev swiper-button-black"></div>
#          <div class="swiper-button-next swiper-button-black"></div>
#          '
#        )
        $link.replaceWith($swiper)

        swiperGallery = new Swiper('.swiper-gallery',
          loop: false
          nextButton: '#swiperGalleryBtn .swiper-button-next'
          prevButton: '#swiperGalleryBtn .swiper-button-prev'
          paginationClickable: true
        #      scrollbar: '.swiper-scrollbar'
        #      speed: 400
        #      spaceBetween: 100
          effect: 'coverflow'
          grabCursor: true
          centeredSlides: true
          slidesPerView: 'auto'
          coverflow:
            rotate: 50
            stretch: 0
            depth: 100
            modifier: 1
            slideShadows: true
        )

        #   lightbox
        $('.swiper-gallery').magnificPopup
          delegate: 'a'
          type: 'image'
          closeOnContentClick: false
          closeBtnInside: false
          mainClass: 'mfp-with-zoom mfp-img-mobile'
          image:
            verticalFit: true
          gallery: enabled: true
          zoom:
            enabled: true
            duration: 300
            opener: (element) ->
              element.find 'img'
    )

    swiperCarousel = new Swiper('.swiper-carousel', {
      loop: true
      nextButton:  '#swiperCarouselBtn .swiper-button-next'
      prevButton: '#swiperCarouselBtn .swiper-button-prev'
      slidesPerView: 4
      slidesPerGroup: 4
      paginationClickable: true
      spaceBetween: 20
    })

    $("#food .nav-btns-menu a").click((e)->
      e.preventDefault()
      $(@).parent().find('a').removeClass('selected')
      $(@).addClass('selected')
      $(this).tab('show')
    )
    $('#food .nav-btns-person a').click((e)->
      e.preventDefault()
      $(@).closest('.tab-pane').find('.nav-btns-person a').removeClass('selected')
      $(@).addClass('selected')
      $(@).closest('.tab-pane').find('.nav-btns-person a[href="'+$(@).attr('href')+'"]').addClass('selected')
      $(this).tab('show')
    )
    $('.nav-btns-person:hidden a:nth-child(1)').click()
    $('#food .nav-btns-menu a:first').click()

    $('.table').each(()->
      $('tr.td').filter(':odd').addClass('even')
    )

) jQuery
