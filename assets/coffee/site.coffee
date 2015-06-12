(($) ->
  $ ->
#   menu

#    $('.dropdown-full').hover(->
#      if (!$(@).hasClass('open'))
#        $(@).find('.dropdown-toggle').dropdown('toggle')
#    ,->
#      if ($(@).hasClass('open'))
#        $(@).find('.dropdown-toggle').dropdown('toggle')
#    )
    $navbarMain = $('#navbar-main')
    $navbarMainBtn = $('#navbar-main-btn')
    $flagDocWidthXs = $(window).width() > 768
    $flagNavbarMainScroll = $(window).scrollTop() > $('#navbar-main-trigger').offset().top
    $('#navbar-main-trigger').affix({
      offset: {
        top: ()->
          if $flagDocWidthXs
            $('#navbar-main-trigger').offset().top
          else
            10000000000
      }
    }).on('affix.bs.affix', ()->
      $navbarMain.addClass('collapse affix')
      $navbarMainBtn.show()
    ).on('affix-top.bs.affix', ()->
      $navbarMainBtn.hide()
      $navbarMain.removeClass('collapse affix')
    )
    if $flagNavbarMainScroll  and $flagDocWidthXs
      $navbarMain.addClass('collapse affix')
      $navbarMainBtn.show()

    uri = new URI()
    uriSegmentFirst = uri.segment(0)
    $('#navbar-main-collapse ul li a').each(()->
      $this = $(this)
      if $this.attr('href') and new URI($this.attr('href')).segment(0) == uriSegmentFirst
        $this.parent().addClass('active')
    )
    $('.nav-btns-active a').each ()->
      $this = $(this)
      if $this.attr('href') and new URI($this.attr('href')).segment(0) == uriSegmentFirst
        $this.addClass('selected')
    if uriSegmentFirst == "articles"
      $('#navbar-main-collapse ul li a[href="/news/"]').parent().addClass('active')
    console.log(uriSegmentFirst)

#   hyphenate
    $('.hypher').hyphenate('ru')

#   main slider
    TimerInterval = (callback, delay) ->
      timerId = undefined
      remaining = delay
      @pause = ->
        clearTimeout timerId
      @resume = ->
        clearTimeout timerId
        timerId = setInterval(callback, remaining)
      @resume()

#    sliderTimer = new TimerInterval((->
#      $('#serviceSlider .icon-right').click()
#    ), $('#serviceSlider').data('sliderTimeout'))


#    $('#serviceTabs .tab, #serviceSlider').hover(
#      ->
#        sliderTimer.pause()
#      ,->
#        sliderTimer.resume()
#    )

    swiperIndex = new Swiper('#swiperIndex', {
      loop: true
      nextButton:  '#swiperIndex .icon-left'
      prevButton: '#swiperIndex .icon-right'
      slidesPerView: 1
      effect: 'fade'
      speed: 1000
      paginationClickable: true
    })

    sliderTimerHover = null
    $('#serviceTabs .tab').hover ->
      clearTimeout(sliderTimerHover) if sliderTimerHover
      sliderTimerHover = setTimeout( () =>
        console.log($(@).index())
        swiperIndex.slideTo($(@).index() + 1)
      , $('#swiperIndex').data('sliderTimeoutHover'))

#   why us
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

#   lightbox form
    magnificPopup = $.magnificPopup.instance
    $('.btn-popup').magnificPopup
      type: 'inline'
      preloader: false
      focus: '#inputName'
      removalDelay: 500
      mainClass: 'mfp-move-from-top'
    $('#inputDate').datepicker(
      language: 'ru'
      orientation: 'bottom'
    )
    $popupForm = $('.popup-form')
    $popupForm.validator().on 'submit', (e) ->
      if e.isDefaultPrevented()
        console.log('validation fail')
      else
        e.preventDefault()
        $target = $(e.target)
        $.ajax
          type: 'POST'
          url: $target.attr('action')
          data: $target.serialize()
          dataType: "json"
          success: (data) ->
            $('#popup-alert-success').magnificPopup(items:
              src: '#popup-alert-success'
              type: 'inline').magnificPopup 'open'
            setTimeout(()->
              e.target.reset()
              magnificPopup.close()
            , 700)
          error: (xhr, str) ->
            console.error(xhr)
            console.error(str)
            alert('Возникла ошибка: ' + xhr.responseCode)

#   #btn scroll top
    $('#btn-top').affix
      offset:
        top: ()->
          document.documentElement.clientHeight + 200
        bottom: 200
    $('#btn-top').on 'click', (e)->
      e.preventDefault()
      $('body,html').animate
          scrollTop: 0
        , 700

#   lightbox images gallery
    lightboxImages = (slector) ->
      $(slector).magnificPopup
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

#   gphoto images grid
    $.fn.gphoto.provider['ggrid'] =
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
        lightboxImages(".ggrid") if @.lightbox

    $('a.gphoto-ggrid-lightbox').gphoto(
      provider: 'ggrid'
      columns: 3
      maxWidth: 1170
      padding: 5
      lightbox: true
    )

    $('a.gphoto-ggrid-about').gphoto(
      provider: 'ggrid'
      columns: 2
      maxWidth: 557
      padding: 5
      template: '1-2-2'
      lightbox: true
    )

#   gphoto gallery
    $.fn.gphoto.provider['swiper'] =
      filter: (imageUrl, image)->
        image: "#{imageUrl}/#{@.imageSize}/"
        thumb: "#{imageUrl}/#{@.thumbSize}/"
      insert: ($link, images)->
        $swiper = $('<div class="swiper-container"></div>')
        $swiperWrapper = $('<div class="swiper-wrapper"></div>')
        $.each(images, (index, element)->
          $swiperWrapper.append(
            """
            <div class="swiper-slide">
               <a href="#{element.image}" data-effect="mfp-zoom-in">
                  <img src="#{element.thumb}" class="img-responsive"/>
                </a>
            </div>
            """
          )
        )
        $swiper.append($swiperWrapper)
        $swiper.addClass(@.containerClass)
        $link.replaceWith($swiper)
        btnCntrSelector = $link.data("buttonContainer")
        new Swiper($swiper, jQuery.extend(@.swiper, {
          nextButton: "#{btnCntrSelector} .swiper-button-next"
          prevButton: "#{btnCntrSelector} .swiper-button-prev"
        }))
        lightboxImages(".#{@.containerClass}")

    $('a.swiper-link-gallery').gphoto(
      provider: 'swiper'
      imageSize: 'w1600'
      thumbSize: 'w300-h300-c'
      containerClass: 'swiper-gallery'
      swiper:
        paginationClickable: true
        effect: 'coverflow'
        grabCursor: true
        centeredSlides: false
        slidesPerView: 'auto'
        coverflow:
          rotate: 50
          stretch: 0
          depth: 100
          modifier: 1
          slideShadows: true
    )

    $('a.swiper-link-carousel').gphoto(
      provider: 'swiper'
      imageSize: 'w1600'
      thumbSize: 'w300-h200-c'
      containerClass: 'swiper-carousel'
      swiper:
        loop: true
        nextButton:  '#swiperCarouselBtn .swiper-button-next'
        prevButton: '#swiperCarouselBtn .swiper-button-prev'
        slidesPerView: 4
        slidesPerGroup: 4
        paginationClickable: true
        spaceBetween: 20
    )

#   Clients carousel
    swiperCarousel = new Swiper('.swiper-carousel', {
      loop: true
      nextButton:  '#btnClients .swiper-button-next'
      prevButton: '#btnClients .swiper-button-prev'
      slidesPerView: 4
      slidesPerGroup: 4
      paginationClickable: true
      spaceBetween: 20
    })

#   food tabs
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
    $('#food .nav-btns-person:hidden a:nth-child(1)').click()
    $('#food .nav-btns-menu a:first').click()

    $('#food .table').each(()->
      $('tr.td').filter(':odd').addClass('even')

  )
) jQuery
