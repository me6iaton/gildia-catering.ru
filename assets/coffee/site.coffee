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
        $swiper.append(
          '
          <div class="swiper-button-prev swiper-button-black"></div>
          <div class="swiper-button-next swiper-button-black"></div>
          '
        )
        $link.replaceWith($swiper)

        swiperGallery = new Swiper('.swiper-gallery',
          loop: true
          nextButton: '.swiper-button-next'
          prevButton: '.swiper-button-prev'
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
      pagination: '.swiper-pagination'
      nextButton: '.swiper-button-next'
      prevButton: '.swiper-button-prev'
      slidesPerView: 6
      paginationClickable: true
      spaceBetween: 30
    })

#   lightbox
) jQuery
