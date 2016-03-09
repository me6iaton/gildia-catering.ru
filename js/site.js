(function($) {
  $.fn.extend({
    gphoto: function(options) {
      var provider, settings;
      settings = {
        provider: 'fotorama'
      };
      settings = $.extend(settings, options);
      provider = $.fn.gphoto.provider;
      return this.filter("[href ^= https\\:\\/\\/plus\\.google\\.com\\/photos]").each(function() {
        var $link, albumId, url, userId;
        $link = $(this);
        url = new URI($link.attr('href'));
        userId = url.segment(1);
        albumId = url.segment(3);
        return $.getJSON("https://picasaweb.google.com/data/feed/api/user/" + userId + "/albumid/" + albumId + "?kind=photo&access=public&alt=json-in-script&callback=?", function(data, status) {
          var images;
          images = data.feed.entry.map(function(image) {
            var imageUrl;
            url = new URI(image.content.src);
            imageUrl = (url.protocol()) + "://" + (url.host()) + (url.directory());
            return provider[settings.provider].filter.call(settings, imageUrl, image);
          });
          provider[settings.provider].insert.call(settings, $link, images);
        });
      });
    }
  });
  return $.fn.gphoto.provider = {
    fotorama: {
      filter: function(imageUrl, image) {
        return {
          img: imageUrl + "w0/",
          thumb: imageUrl + "w64-h64/"
        };
      },
      insert: function($link, images) {
        var $fotorama;
        $fotorama = $('<div class="fotorama"></div>');
        $link.replaceWith($fotorama);
        $fotorama.fotorama($.extend({
          data: images
        }, this));
      }
    },
    ggrid: {
      filter: function(imageUrl, image) {
        return {
          imageUrl: imageUrl,
          data: image
        };
      },
      insert: function($link, images) {
        var $ggrid, options;
        $ggrid = $('<div class="ggrid"></div>');
        options = {
          data: images
        };
        if ($link.attr("title") != null) {
          options['template'] = $link.attr("title");
        }
        $link.replaceWith($ggrid);
        $ggrid.ggrid($.extend(options, this));
        $ggrid.find('a').fluidbox();
      }
    }
  };
})(jQuery);

(function($) {
  return $.fn.extend({
    ggrid: function(options) {
      var $this, chunk, i, images, iter, methods, settings, template;
      $this = this;
      settings = {
        columns: 4,
        maxWidth: 1170,
        padding: 5
      };
      settings = $.extend(settings, options);
      methods = {
        makeRow: function(images) {
          var $out, constanta, image, j, len, maxWidth, width;
          $out = $("<div data-paragraph-count='" + images.length + "' class='row'></div>");
          constanta = 1 / images.reduceRight(function(one, two) {
            if (images.length !== 1) {
              return (one.data ? 1 / (Number(one.data.gphoto$height.$t) / Number(one.data.gphoto$width.$t)) : one) + 1 / (Number(two.data.gphoto$height.$t) / Number(two.data.gphoto$width.$t));
            }
          });
          for (j = 0, len = images.length; j < len; j++) {
            image = images[j];
            if (images.length !== 1) {
              width = constanta / (Number(image.data.gphoto$height.$t) / Number(image.data.gphoto$width.$t)) * 100;
              maxWidth = Math.round(settings.maxWidth / 100 * width);
            } else {
              width = 100;
              maxWidth = 0;
            }
            $out.append("<div class='col' style='width: " + width + "%;'>\n  <a href=\"" + image.imageUrl + "/w0/\">\n    <img class='img-responsive' src='" + image.imageUrl + "/w" + maxWidth + "/' alt='' />\n  </a>\n</div>");
          }
          $this.append($out);
        }
      };
      images = options.data;
      if (options.template != null) {
        template = options.template.split('-');
      }
      chunk;
      i = 0;
      iter = 0;
      while (i < images.length) {
        if (template != null ? template[iter] : void 0) {
          chunk = Number(template[iter]);
          iter++;
        } else {
          chunk = images.length - (i + settings.columns) === 1 ? settings.columns - 1 : settings.columns;
        }
        methods.makeRow(images.slice(i, i + chunk));
        i += chunk;
      }
      return this.each(function() {
        console.log('ggrid');
      });
    }
  });
})(jQuery);

(function($) {
  return $(function() {
    var $flagDocWidthXs, $flagNavbarMainScroll, $navbarMain, $navbarMainBtn, $popupForm, TimerInterval, lightboxImages, magnificPopup, sliderTimer, sliderTimerAutoplay, sliderTimerHover, swiperCarousel, swiperIndex, transform, uri, uriSegmentFirst;
    $('.hypher').hyphenate('ru');
    $navbarMain = $('#navbar-main');
    $navbarMainBtn = $('#navbar-main-btn');
    $flagDocWidthXs = $(window).width() > 768;
    $flagNavbarMainScroll = $(window).scrollTop() > $('#navbar-main-trigger').offset().top;
    $('#navbar-main-trigger').affix({
      offset: {
        top: function() {
          if ($flagDocWidthXs) {
            return $('#navbar-main-trigger').offset().top;
          } else {
            return 10000000000;
          }
        }
      }
    }).on('affix.bs.affix', function() {
      $navbarMain.addClass('collapse affix');
      return $navbarMainBtn.show();
    }).on('affix-top.bs.affix', function() {
      $navbarMainBtn.hide();
      return $navbarMain.removeClass('collapse affix');
    });
    if ($flagNavbarMainScroll && $flagDocWidthXs) {
      $navbarMain.addClass('collapse affix');
      $navbarMainBtn.show();
    }
    uri = new URI();
    uriSegmentFirst = uri.segment(0);
    $('#navbar-main-collapse ul li a').each(function() {
      var $this;
      $this = $(this);
      if ($this.attr('href') && new URI($this.attr('href')).segment(0) === uriSegmentFirst) {
        return $this.parent().addClass('active');
      }
    });
    $('.nav-btns-active a').each(function() {
      var $this;
      $this = $(this);
      if ($this.attr('href') && new URI($this.attr('href')).segment(0) === uriSegmentFirst) {
        return $this.addClass('selected');
      }
    });
    if (uriSegmentFirst === "articles") {
      $('#navbar-main-collapse ul li a[href="/news/"]').parent().addClass('active');
    }
    console.log(uriSegmentFirst);
    if (($('#swiperIndex')[0])) {
      TimerInterval = function(callback, delay) {
        var remaining, timerId;
        timerId = void 0;
        remaining = delay;
        this.pause = function() {
          return clearTimeout(timerId);
        };
        this.resume = function() {
          clearTimeout(timerId);
          return timerId = setInterval(callback, remaining);
        };
        return this.resume();
      };
      swiperIndex = new Swiper('#swiperIndex', {
        loop: true,
        nextButton: '#swiperIndex .icon-right',
        prevButton: '#swiperIndex .icon-left',
        slidesPerView: 1,
        effect: 'fade',
        speed: 1000,
        paginationClickable: true
      });
      sliderTimer = new TimerInterval(function() {
        swiperIndex.update(true);
        return swiperIndex.slideNext();
      }, $('#swiperIndex').data('sliderTimeout'));
      sliderTimerAutoplay = null;
      $('#serviceTabs .tab, #swiperIndex').hover(function() {
        if (sliderTimerAutoplay) {
          clearTimeout(sliderTimerAutoplay);
        }
        return sliderTimerAutoplay = setTimeout(function() {
          return sliderTimer.pause();
        }, 100);
      }, function() {
        return sliderTimerAutoplay = setTimeout(function() {
          return sliderTimer.resume();
        }, 100);
      });
      $('#serviceTabs .tab').eq(0).addClass('hover');
      swiperIndex.on('slideChangeStart', function() {
        var index;
        index = swiperIndex.activeIndex - 1;
        if (index === 8) {
          index = 0;
        }
        $('#serviceTabs .tab').removeClass('hover');
        return $('#serviceTabs .tab').eq(index).addClass('hover');
      });
      sliderTimerHover = null;
      $('#serviceTabs .tab').hover(function() {
        if (sliderTimerHover) {
          clearTimeout(sliderTimerHover);
        }
        return sliderTimerHover = setTimeout((function(_this) {
          return function() {
            return swiperIndex.slideTo($(_this).index() + 1);
          };
        })(this), $('#swiperIndex').data('sliderTimeoutHover'));
      });
    }
    transform = function(a, b) {
      b.classList.remove('hidden');
      ramjet.transform(a, b, {
        done: function() {
          b.classList.remove('hidden');
          if ($(a).hasClass('whyus-intro')) {
            return $('.whyus').css('min-height', $(b).find('.row').innerHeight() + 20);
          } else {
            return $('.whyus').css('min-height', '');
          }
        }
      });
      a.classList.add('hidden');
      return b.classList.add('hidden');
    };
    $('.whyus-intro').click(function() {
      return transform(this, this.nextSibling);
    });
    $('.whyus-detail').click(function() {
      return transform(this, this.previousSibling);
    });
    $.fn.serializeObject = function() {
      var a, o;
      o = {};
      a = this.serializeArray();
      $.each(a, function() {
        if (o[this.name] !== void 0) {
          if (!o[this.name].push) {
            o[this.name] = [o[this.name]];
          }
          o[this.name].push(this.value || '');
        } else {
          o[this.name] = this.value || '';
        }
      });
      return o;
    };
    magnificPopup = $.magnificPopup.instance;
    $('.btn-popup').magnificPopup({
      type: 'inline',
      preloader: false,
      focus: '#inputName',
      removalDelay: 500,
      mainClass: 'mfp-move-from-top'
    });
    $('#inputDate').datepicker({
      language: 'ru',
      orientation: 'bottom'
    });
    $popupForm = $('.popup-form');
    $popupForm.validator().on('submit', function(e) {
      var $target, formData, formDataArr, formMessage;
      if (e.isDefaultPrevented()) {
        return console.log('validation fail');
      } else {
        e.preventDefault();
        $target = $(e.target);
        formDataArr = $target.serializeArray();
        formMessage = '<table cellspacing="0" cellpadding="10" border="0" width="100%"><tbody>';
        formDataArr.forEach(function(element) {
          if (element.name !== '_subject') {
            return formMessage = formMessage.concat("<tr> <td align='right' valign='top' style='padding:5px 5px 5px 0;' width='200'> <strong> " + element.name + ":</strong> </td> <td align='left' valign='top' style='padding:5px 5px 5px 0;' width='*'> " + element.value + "</td> </tr> ");
          }
        });
        formMessage = formMessage.concat('</tbody></table>');
        formData = $target.serializeObject();
        if (formData['email'] == null) {
          formData['email'] = 'info@gildia-catering.ru';
        }
        return $.ajax({
          type: 'POST',
          url: 'https://mandrillapp.com/api/1.0/messages/send.json',
          data: {
            key: 'EKZL8t3uhKvqmT5Gx3rz_w',
            message: {
              from_email: formData['email'],
              from_name: formData['Ваше имя'],
              headers: {
                'Reply-To': formData['email']
              },
              html: formMessage,
              subject: formData['_subject'],
              to: [
                {
                  email: 'info@gildia-catering.ru'
                }
              ]
            }
          },
          success: function(data) {
            $('#popup-alert-success').magnificPopup({
              items: {
                src: '#popup-alert-success',
                type: 'inline'
              }
            }).magnificPopup('open');
            return setTimeout(function() {
              e.target.reset();
              return magnificPopup.close();
            }, 700);
          },
          error: function(xhr, str) {
            console.error(xhr);
            console.error(str);
            return alert('Возникла ошибка: ' + xhr.responseCode);
          }
        });
      }
    });
    $('#btn-top').affix({
      offset: {
        top: 500,
        bottom: 200
      }
    });
    $('#btn-top').on('click', function(e) {
      e.preventDefault();
      return $('body,html').animate({
        scrollTop: 0
      }, 700);
    });
    lightboxImages = function(slector) {
      return $(slector).magnificPopup({
        delegate: 'a',
        type: 'image',
        closeOnContentClick: false,
        closeBtnInside: false,
        mainClass: 'mfp-with-zoom mfp-img-mobile',
        image: {
          verticalFit: true
        },
        gallery: {
          enabled: true
        },
        zoom: {
          enabled: true,
          duration: 300,
          opener: function(element) {
            return element.find('img');
          }
        }
      });
    };
    $.fn.gphoto.provider['ggrid'] = {
      filter: function(imageUrl, image) {
        return {
          imageUrl: imageUrl,
          data: image
        };
      },
      insert: function($link, images) {
        var $ggrid, options;
        $ggrid = $('<div class="ggrid"></div>');
        options = {
          data: images
        };
        if ($link.attr("title") != null) {
          options['template'] = $link.attr("title");
        }
        $link.replaceWith($ggrid);
        $ggrid.ggrid($.extend(options, this));
        if (this.lightbox) {
          return lightboxImages(".ggrid");
        }
      }
    };
    $('a.gphoto-ggrid-lightbox').gphoto({
      provider: 'ggrid',
      columns: 3,
      maxWidth: 1170,
      padding: 5,
      lightbox: true
    });
    $('a.gphoto-ggrid-about').gphoto({
      provider: 'ggrid',
      columns: 2,
      maxWidth: 800,
      padding: 5,
      template: '1-2-2',
      lightbox: true
    });
    $.fn.gphoto.provider['swiper'] = {
      filter: function(imageUrl, image) {
        return {
          image: imageUrl + "/" + this.imageSize + "/",
          thumb: imageUrl + "/" + this.thumbSize + "/"
        };
      },
      insert: function($link, images) {
        var $swiper, $swiperWrapper, btnCntrSelector, swiper;
        $swiper = $('<div class="swiper-container"></div>');
        $swiperWrapper = $('<div class="swiper-wrapper"></div>');
        $.each(images, function(index, element) {
          return $swiperWrapper.append("<div class=\"swiper-slide\">\n   <a href=\"" + element.image + "\" data-effect=\"mfp-zoom-in\">\n      <img src=\"" + element.thumb + "\" class=\"img-responsive\"/>\n    </a>\n</div>");
        });
        $swiper.append($swiperWrapper);
        $swiper.addClass(this.containerClass);
        $link.replaceWith($swiper);
        btnCntrSelector = $link.data("buttonContainer");
        swiper = new Swiper($swiper, jQuery.extend(this.swiper, {
          nextButton: btnCntrSelector + " .swiper-button-next",
          prevButton: btnCntrSelector + " .swiper-button-prev"
        }));
        swiper.slideTo(1, 0);
        return lightboxImages("." + this.containerClass);
      }
    };
    $('a.swiper-link-gallery').gphoto({
      provider: 'swiper',
      imageSize: 'w1600',
      thumbSize: 'w300-h300-c',
      containerClass: 'swiper-gallery',
      swiper: {
        paginationClickable: true,
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: false,
        slidesPerView: 'auto',
        loop: true,
        nextButton: '#swiperGalleryBtn .swiper-button-next',
        prevButton: '#swiperGalleryBtn .swiper-button-prev',
        coverflow: {
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true
        }
      }
    });
    $('a.swiper-link-carousel').gphoto({
      provider: 'swiper',
      imageSize: 'w1600',
      thumbSize: 'w300-h200-c',
      containerClass: 'swiper-carousel',
      swiper: {
        loop: true,
        nextButton: '#swiperCarouselBtn .swiper-button-next',
        prevButton: '#swiperCarouselBtn .swiper-button-prev',
        slidesPerView: 4,
        slidesPerGroup: 4,
        paginationClickable: true,
        spaceBetween: 20
      }
    });
    $('a.swiper-link-artists').gphoto({
      provider: 'swiper',
      imageSize: 'w1600',
      thumbSize: 'w150-h150-c',
      containerClass: 'swiper-artists',
      swiper: {
        loop: true,
        nextButton: '#swiperCarouselBtn .swiper-button-next',
        prevButton: '#swiperCarouselBtn .swiper-button-prev',
        slidesPerView: 3,
        slidesPerGroup: 3,
        paginationClickable: true,
        spaceBetween: 10
      }
    });
    $('#accordion a').one('click', function() {
      return $(this).closest('.panel').find('.swiper-container').each(function() {
        return setTimeout((function(_this) {
          return function() {
            return _this.swiper.update(true);
          };
        })(this), 100);
      });
    });
    $('#accordion .fa-angle-left').on('click', function(e) {
      return $(this).parent().parent().find('.swiper-container')[0].swiper.slidePrev();
    });
    $('#accordion .fa-angle-right').on('click', function(e) {
      return $(this).parent().parent().find('.swiper-container')[0].swiper.slideNext();
    });
    swiperCarousel = new Swiper('.swiper-carousel', {
      loop: true,
      nextButton: '#btnClients .swiper-button-next',
      prevButton: '#btnClients .swiper-button-prev',
      slidesPerView: 4,
      slidesPerGroup: 4,
      paginationClickable: true,
      spaceBetween: 20
    });
    $("#food .nav-btns-menu a").click(function(e) {
      e.preventDefault();
      $(this).parent().find('a').removeClass('selected');
      $(this).addClass('selected');
      return $(this).tab('show');
    });
    $('#food .nav-btns-person a').click(function(e) {
      e.preventDefault();
      $(this).closest('.tab-pane').find('.nav-btns-person a').removeClass('selected');
      $(this).addClass('selected');
      $(this).closest('.tab-pane').find('.nav-btns-person a[href="' + $(this).attr('href') + '"]').addClass('selected');
      return $(this).tab('show');
    });
    $('#food .nav-btns-person:hidden a:nth-child(1)').click();
    $('#food .nav-btns-menu a:first').click();
    return $('#food .table').each(function() {
      return $('tr.td').filter(':odd').addClass('even');
    });
  });
})(jQuery);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpxdWVyeS5ncGhvdG8uY29mZmVlIiwianF1ZXJ5LmdncmlkLmNvZmZlZSIsInNpdGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQUMsU0FBQyxDQUFELEdBQUE7QUFDQyxFQUFBLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTCxDQUNFO0FBQUEsSUFBQSxNQUFBLEVBQVEsU0FBQyxPQUFELEdBQUE7QUFDTixVQUFBLGtCQUFBO0FBQUEsTUFBQSxRQUFBLEdBQ0U7QUFBQSxRQUFBLFFBQUEsRUFBVSxVQUFWO09BREYsQ0FBQTtBQUFBLE1BR0EsUUFBQSxHQUFXLENBQUMsQ0FBQyxNQUFGLENBQVMsUUFBVCxFQUFtQixPQUFuQixDQUhYLENBQUE7QUFBQSxNQUlBLFFBQUEsR0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUp2QixDQUFBO0FBT0EsYUFBTyxJQUFDLENBQUMsTUFBRixDQUFTLHNEQUFULENBQWdFLENBQUMsSUFBakUsQ0FBc0UsU0FBQSxHQUFBO0FBQzNFLFlBQUEsMkJBQUE7QUFBQSxRQUFBLEtBQUEsR0FBUSxDQUFBLENBQUUsSUFBRixDQUFSLENBQUE7QUFBQSxRQUNBLEdBQUEsR0FBVSxJQUFBLEdBQUEsQ0FBSSxLQUFLLENBQUMsSUFBTixDQUFXLE1BQVgsQ0FBSixDQURWLENBQUE7QUFBQSxRQUVBLE1BQUEsR0FBUyxHQUFHLENBQUMsT0FBSixDQUFZLENBQVosQ0FGVCxDQUFBO0FBQUEsUUFHQSxPQUFBLEdBQVUsR0FBRyxDQUFDLE9BQUosQ0FBWSxDQUFaLENBSFYsQ0FBQTtlQUlBLENBQUMsQ0FBQyxPQUFGLENBQ0Usa0RBQUEsR0FBbUQsTUFBbkQsR0FBMEQsV0FBMUQsR0FBcUUsT0FBckUsR0FBNkUseURBRC9FLEVBRUUsU0FBQyxJQUFELEVBQU8sTUFBUCxHQUFBO0FBQ0UsY0FBQSxNQUFBO0FBQUEsVUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FB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TCxDQUFhLFdBQWIsQ0FBeUIsQ0FBQyxJQUExQixDQUErQixvQkFBL0IsQ0FBb0QsQ0FBQyxXQUFyRCxDQUFpRSxVQUFqRSxDQURBLENBQUE7QUFBQSxNQUVBLENBQUEsQ0FBRSxJQUFGLENBQUksQ0FBQyxRQUFMLENBQWMsVUFBZCxDQUZBLENBQUE7QUFBQSxNQUdBLENBQUEsQ0FBRSxJQUFGLENBQUksQ0FBQyxPQUFMLENBQWEsV0FBYixDQUF5QixDQUFDLElBQTFCLENBQStCLDJCQUFBLEdBQTRCLENBQUEsQ0FBRSxJQUFGLENBQUksQ0FBQyxJQUFMLENBQVUsTUFBVixDQUE1QixHQUE4QyxJQUE3RSxDQUFrRixDQUFDLFFBQW5GLENBQTRGLFVBQTVGLENBSEEsQ0FBQTthQUlBLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxHQUFSLENBQVksTUFBWixFQUxrQztJQUFBLENBQXBDLENBdFhBLENBQUE7QUFBQSxJQTZYQSxDQUFBLENBQUUsOENBQUYsQ0FBaUQsQ0FBQyxLQUFsRCxDQUFBLENBN1hBLENBQUE7QUFBQSxJQThYQSxDQUFBLENBQUUsOEJBQUYsQ0FBaUMsQ0FBQyxLQUFsQyxDQUFBLENBOVhBLENBQUE7V0FnWUEsQ0FBQSxDQUFFLGNBQUYsQ0FBaUIsQ0FBQyxJQUFsQixDQUF1QixTQUFBLEdBQUE7YUFDckIsQ0FBQSxDQUFFLE9BQUYsQ0FBVSxDQUFDLE1BQVgsQ0FBa0IsTUFBbEIsQ0FBeUIsQ0FBQyxRQUExQixDQUFtQyxNQUFuQyxFQURxQjtJQUFBLENBQXZCLEVBbFlBO0VBQUEsQ0FBRixFQUREO0FBQUEsQ0FBRCxDQUFBLENBd1lFLE1BeFlGLENBQUEsQ0FBQSIsImZpbGUiOiJzaXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKCgkKSAtPlxuICAkLmZuLmV4dGVuZFxuICAgIGdwaG90bzogKG9wdGlvbnMpIC0+XG4gICAgICBzZXR0aW5ncyA9XG4gICAgICAgIHByb3ZpZGVyOiAnZm90b3JhbWEnXG5cbiAgICAgIHNldHRpbmdzID0gJC5leHRlbmQgc2V0dGluZ3MsIG9wdGlvbnNcbiAgICAgIHByb3ZpZGVyID0gJC5mbi5ncGhvdG8ucHJvdmlkZXJcblxuICAgICAgIyBib2R5IHNjcmlwdFxuICAgICAgcmV0dXJuIEAuZmlsdGVyKFwiW2hyZWYgXj0gaHR0cHNcXFxcOlxcXFwvXFxcXC9wbHVzXFxcXC5nb29nbGVcXFxcLmNvbVxcXFwvcGhvdG9zXVwiKS5lYWNoICgpIC0+XG4gICAgICAgICRsaW5rID0gJChAKVxuICAgICAgICB1cmwgPSBuZXcgVVJJKCRsaW5rLmF0dHIoJ2hyZWYnKSlcbiAgICAgICAgdXNlcklkID0gdXJsLnNlZ21lbnQoMSlcbiAgICAgICAgYWxidW1JZCA9IHVybC5zZWdtZW50KDMpXG4gICAgICAgICQuZ2V0SlNPTihcbiAgICAgICAgICBcImh0dHBzOi8vcGljYXNhd2ViLmdvb2dsZS5jb20vZGF0YS9mZWVkL2FwaS91c2VyLyN7dXNlcklkfS9hbGJ1bWlkLyN7YWxidW1JZH0/a2luZD1waG90byZhY2Nlc3M9cHVibGljJmFsdD1qc29uLWluLXNjcmlwdCZjYWxsYmFjaz0/XCIsXG4gICAgICAgICAgKGRhdGEsIHN0YXR1cykgLT5cbiAgICAgICAgICAgIGltYWdlcyA9IGRhdGEuZmVlZC5lbnRyeS5tYXAgKGltYWdlKSAtPlxuICAgICAgICAgICAgICB1cmwgPSAgbmV3IFVSSShpbWFnZS5jb250ZW50LnNyYylcbiAgICAgICAgICAgICAgaW1hZ2VVcmwgPSBcIiN7dXJsLnByb3RvY29sKCl9Oi8vI3t1cmwuaG9zdCgpfSN7dXJsLmRpcmVjdG9yeSgpfVwiXG4gICAgICAgICAgICAgIHByb3ZpZGVyW3NldHRpbmdzLnByb3ZpZGVyXS5maWx0ZXIuY2FsbChzZXR0aW5ncywgaW1hZ2VVcmwsIGltYWdlKVxuICAgICAgICAgICAgcHJvdmlkZXJbc2V0dGluZ3MucHJvdmlkZXJdLmluc2VydC5jYWxsKHNldHRpbmdzLCAkbGluaywgaW1hZ2VzKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIClcbiMgaW5pdCBkZWZhdWx0IHByb3ZpZGVyc1xuIyB0b2RvLW1lIG5lZWQgcmVzdCBhZnRlciByZWZhY3RvclxuICAkLmZuLmdwaG90by5wcm92aWRlciA9XG4gICAgZm90b3JhbWE6XG4gICAgICBmaWx0ZXI6IChpbWFnZVVybCwgaW1hZ2UpIC0+XG4gICAgICAgIGltZzogXCIje2ltYWdlVXJsfXcwL1wiXG4gICAgICAgIHRodW1iOiBcIiN7aW1hZ2VVcmx9dzY0LWg2NC9cIlxuICAgICAgaW5zZXJ0OiAoJGxpbmssIGltYWdlcykgLT5cbiAgICAgICAgJGZvdG9yYW1hID0gJCgnPGRpdiBjbGFzcz1cImZvdG9yYW1hXCI+PC9kaXY+JylcbiAgICAgICAgJGxpbmsucmVwbGFjZVdpdGgoJGZvdG9yYW1hKVxuICAgICAgICAkZm90b3JhbWEuZm90b3JhbWEgJC5leHRlbmQgZGF0YTogaW1hZ2VzLCBAXG4gICAgICAgIHJldHVyblxuICAgIGdncmlkOlxuICAgICAgZmlsdGVyOiAoaW1hZ2VVcmwsIGltYWdlKSAtPlxuICAgICAgICBpbWFnZVVybDogaW1hZ2VVcmxcbiAgICAgICAgZGF0YTogaW1hZ2VcbiAgICAgIGluc2VydDogKCRsaW5rLCBpbWFnZXMpIC0+XG4gICAgICAgICRnZ3JpZCA9ICQoJzxkaXYgY2xhc3M9XCJnZ3JpZFwiPjwvZGl2PicpXG4gICAgICAgIG9wdGlvbnMgPSBkYXRhOiBpbWFnZXNcbiAgICAgICAgaWYgJGxpbmsuYXR0cihcInRpdGxlXCIpP1xuICAgICAgICAgIG9wdGlvbnNbJ3RlbXBsYXRlJ10gPSAgJGxpbmsuYXR0cihcInRpdGxlXCIpXG4gICAgICAgICRsaW5rLnJlcGxhY2VXaXRoKCRnZ3JpZClcbiAgICAgICAgJGdncmlkLmdncmlkICQuZXh0ZW5kIG9wdGlvbnMsIEBcbiAgICAgICAgJGdncmlkLmZpbmQoJ2EnKS5mbHVpZGJveCgpXG4gICAgICAgIHJldHVyblxuKSBqUXVlcnlcbiIsIigoJCkgLT5cbiAgJC5mbi5leHRlbmRcbiAgICBnZ3JpZDogKG9wdGlvbnMpIC0+XG4gICAgICAkdGhpcyA9IEBcblxuICAgICAgc2V0dGluZ3MgPVxuICAgICAgICBjb2x1bW5zOiA0XG4gICAgICAgIG1heFdpZHRoOiAxMTcwXG4gICAgICAgIHBhZGRpbmc6IDVcblxuICAgICAgc2V0dGluZ3MgPSAkLmV4dGVuZCBzZXR0aW5ncywgb3B0aW9uc1xuXG4gICAgICBtZXRob2RzID1cbiAgICAgICAgbWFrZVJvdzogKGltYWdlcykgLT5cbiAgICAgICAgICAkb3V0ID0gJChcIjxkaXYgZGF0YS1wYXJhZ3JhcGgtY291bnQ9JyN7aW1hZ2VzLmxlbmd0aH0nIGNsYXNzPSdyb3cnPjwvZGl2PlwiKVxuICAgICAgICAgIGNvbnN0YW50YSA9IDEvaW1hZ2VzLnJlZHVjZVJpZ2h0IChvbmUsIHR3bykgLT5cbiAgICAgICAgICAgIChpZiBvbmUuZGF0YSB0aGVuIDEvKE51bWJlcihvbmUuZGF0YS5ncGhvdG8kaGVpZ2h0LiR0KS9OdW1iZXIob25lLmRhdGEuZ3Bob3RvJHdpZHRoLiR0KSkgZWxzZSBvbmUpICtcdDEvKE51bWJlcih0d28uZGF0YS5ncGhvdG8kaGVpZ2h0LiR0KS9OdW1iZXIodHdvLmRhdGEuZ3Bob3RvJHdpZHRoLiR0KSkgaWYgaW1hZ2VzLmxlbmd0aCAhPSAxXG4gICAgICAgICAgZm9yIGltYWdlIGluIGltYWdlc1xuICAgICAgICAgICAgaWYgaW1hZ2VzLmxlbmd0aCAhPSAxXG4gICAgICAgICAgICAgIHdpZHRoID0gY29uc3RhbnRhLyhOdW1iZXIoaW1hZ2UuZGF0YS5ncGhvdG8kaGVpZ2h0LiR0KS9OdW1iZXIoaW1hZ2UuZGF0YS5ncGhvdG8kd2lkdGguJHQpKSAqIDEwMFxuICAgICAgICAgICAgICBtYXhXaWR0aCA9IE1hdGgucm91bmQoIHNldHRpbmdzLm1heFdpZHRoLzEwMCAqIHdpZHRoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICB3aWR0aCA9IDEwMFxuICAgICAgICAgICAgICBtYXhXaWR0aCA9IDBcbiAgICAgICAgICAgICRvdXQuYXBwZW5kIFwiXCJcIlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSdjb2wnIHN0eWxlPSd3aWR0aDogI3t3aWR0aH0lOyc+XG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cIiN7aW1hZ2UuaW1hZ2VVcmx9L3cwL1wiPlxuICAgICAgICAgICAgICAgICAgPGltZyBjbGFzcz0naW1nLXJlc3BvbnNpdmUnIHNyYz0nI3tpbWFnZS5pbWFnZVVybH0vdyN7bWF4V2lkdGh9LycgYWx0PScnIC8+XG4gICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgJHRoaXMuYXBwZW5kICRvdXRcbiAgICAgICAgICByZXR1cm5cblxuICAgICAgaW1hZ2VzID0gIG9wdGlvbnMuZGF0YVxuICAgICAgdGVtcGxhdGUgPSBvcHRpb25zLnRlbXBsYXRlLnNwbGl0KCctJykgaWYgb3B0aW9ucy50ZW1wbGF0ZT9cbiAgICAgIGNodW5rOyBpID0gMDsgaXRlciA9IDBcbiAgICAgIHdoaWxlIGkgPCBpbWFnZXMubGVuZ3RoXG4gICAgICAgIGlmIHRlbXBsYXRlP1tpdGVyXVxuICAgICAgICAgICNhZGQgdGVtcGxhdGUgbGF5b3V0IHN1cHBvcnQgaW4gdGl0bGUgYXR0clxuICAgICAgICAgIGNodW5rID0gTnVtYmVyKHRlbXBsYXRlW2l0ZXJdKVxuICAgICAgICAgIGl0ZXIrK1xuICAgICAgICBlbHNlXG4gICAgICAgICAgI2RvIG5vdCBzaG93IDEgaW1tYWdlIHRvIGVuZCBncmlkZVxuICAgICAgICAgIGNodW5rID0gaWYgaW1hZ2VzLmxlbmd0aCAtIChpICsgc2V0dGluZ3MuY29sdW1ucykgPT0gMSB0aGVuIHNldHRpbmdzLmNvbHVtbnMgLSAxIGVsc2Ugc2V0dGluZ3MuY29sdW1uc1xuICAgICAgICBtZXRob2RzLm1ha2VSb3cgaW1hZ2VzLnNsaWNlKGksaStjaHVuaylcbiAgICAgICAgaSs9Y2h1bmtcbiAgICAgICMgYm9keSBzY3JpcHRcbiAgICAgIHJldHVybiBALmVhY2ggKCkgLT5cbiAgICAgICAgY29uc29sZS5sb2coJ2dncmlkJylcbiAgICAgICAgcmV0dXJuXG4pIGpRdWVyeVxuIiwiKCgkKSAtPlxuICAkIC0+XG4jICAgaHlwaGVuYXRlXG4gICAgJCgnLmh5cGhlcicpLmh5cGhlbmF0ZSgncnUnKVxuXG4jcmVnaW9uICAgbWVudVxuIyAgICAkKCcuZHJvcGRvd24tZnVsbCcpLmhvdmVyKC0+XG4jICAgICAgaWYgKCEkKEApLmhhc0NsYXNzKCdvcGVuJykpXG4jICAgICAgICAkKEApLmZpbmQoJy5kcm9wZG93bi10b2dnbGUnKS5kcm9wZG93bigndG9nZ2xlJylcbiMgICAgLC0+XG4jICAgICAgaWYgKCQoQCkuaGFzQ2xhc3MoJ29wZW4nKSlcbiMgICAgICAgICQoQCkuZmluZCgnLmRyb3Bkb3duLXRvZ2dsZScpLmRyb3Bkb3duKCd0b2dnbGUnKVxuIyAgICApXG5cbiAgICAkbmF2YmFyTWFpbiA9ICQoJyNuYXZiYXItbWFpbicpXG4gICAgJG5hdmJhck1haW5CdG4gPSAkKCcjbmF2YmFyLW1haW4tYnRuJylcbiAgICAkZmxhZ0RvY1dpZHRoWHMgPSAkKHdpbmRvdykud2lkdGgoKSA+IDc2OFxuICAgICRmbGFnTmF2YmFyTWFpblNjcm9sbCA9ICQod2luZG93KS5zY3JvbGxUb3AoKSA+ICQoJyNuYXZiYXItbWFpbi10cmlnZ2VyJykub2Zmc2V0KCkudG9wXG4gICAgJCgnI25hdmJhci1tYWluLXRyaWdnZXInKS5hZmZpeCh7XG4gICAgICBvZmZzZXQ6IHtcbiAgICAgICAgdG9wOiAoKS0+XG4gICAgICAgICAgaWYgJGZsYWdEb2NXaWR0aFhzXG4gICAgICAgICAgICAkKCcjbmF2YmFyLW1haW4tdHJpZ2dlcicpLm9mZnNldCgpLnRvcFxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIDEwMDAwMDAwMDAwXG4gICAgICB9XG4gICAgfSkub24oJ2FmZml4LmJzLmFmZml4JywgKCktPlxuICAgICAgJG5hdmJhck1haW4uYWRkQ2xhc3MoJ2NvbGxhcHNlIGFmZml4JylcbiAgICAgICRuYXZiYXJNYWluQnRuLnNob3coKVxuICAgICkub24oJ2FmZml4LXRvcC5icy5hZmZpeCcsICgpLT5cbiAgICAgICRuYXZiYXJNYWluQnRuLmhpZGUoKVxuICAgICAgJG5hdmJhck1haW4ucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlIGFmZml4JylcbiAgICApXG4gICAgaWYgJGZsYWdOYXZiYXJNYWluU2Nyb2xsICBhbmQgJGZsYWdEb2NXaWR0aFhzXG4gICAgICAkbmF2YmFyTWFpbi5hZGRDbGFzcygnY29sbGFwc2UgYWZmaXgnKVxuICAgICAgJG5hdmJhck1haW5CdG4uc2hvdygpXG5cbiAgICB1cmkgPSBuZXcgVVJJKClcbiAgICB1cmlTZWdtZW50Rmlyc3QgPSB1cmkuc2VnbWVudCgwKVxuICAgICQoJyNuYXZiYXItbWFpbi1jb2xsYXBzZSB1bCBsaSBhJykuZWFjaCgoKS0+XG4gICAgICAkdGhpcyA9ICQodGhpcylcbiAgICAgIGlmICR0aGlzLmF0dHIoJ2hyZWYnKSBhbmQgbmV3IFVSSSgkdGhpcy5hdHRyKCdocmVmJykpLnNlZ21lbnQoMCkgPT0gdXJpU2VnbWVudEZpcnN0XG4gICAgICAgICR0aGlzLnBhcmVudCgpLmFkZENsYXNzKCdhY3RpdmUnKVxuICAgIClcbiAgICAkKCcubmF2LWJ0bnMtYWN0aXZlIGEnKS5lYWNoICgpLT5cbiAgICAgICR0aGlzID0gJCh0aGlzKVxuICAgICAgaWYgJHRoaXMuYXR0cignaHJlZicpIGFuZCBuZXcgVVJJKCR0aGlzLmF0dHIoJ2hyZWYnKSkuc2VnbWVudCgwKSA9PSB1cmlTZWdtZW50Rmlyc3RcbiAgICAgICAgJHRoaXMuYWRkQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICBpZiB1cmlTZWdtZW50Rmlyc3QgPT0gXCJhcnRpY2xlc1wiXG4gICAgICAkKCcjbmF2YmFyLW1haW4tY29sbGFwc2UgdWwgbGkgYVtocmVmPVwiL25ld3MvXCJdJykucGFyZW50KCkuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgY29uc29sZS5sb2codXJpU2VnbWVudEZpcnN0KVxuI2VuZHJlZ2lvblxuXG4jcmVnaW9uICAgbWFpbiBzbGlkZXJcbiAgICBpZiAoJCgnI3N3aXBlckluZGV4JylbMF0pXG4gICAgICBUaW1lckludGVydmFsID0gKGNhbGxiYWNrLCBkZWxheSkgLT5cbiAgICAgICAgdGltZXJJZCA9IHVuZGVmaW5lZFxuICAgICAgICByZW1haW5pbmcgPSBkZWxheVxuICAgICAgICBAcGF1c2UgPSAtPlxuICAgICAgICAgIGNsZWFyVGltZW91dCB0aW1lcklkXG4gICAgICAgIEByZXN1bWUgPSAtPlxuICAgICAgICAgIGNsZWFyVGltZW91dCB0aW1lcklkXG4gICAgICAgICAgdGltZXJJZCA9IHNldEludGVydmFsKGNhbGxiYWNrLCByZW1haW5pbmcpXG4gICAgICAgIEByZXN1bWUoKVxuXG4gICAgICBzd2lwZXJJbmRleCA9IG5ldyBTd2lwZXIoJyNzd2lwZXJJbmRleCcsIHtcbiAgICAgICAgbG9vcDogdHJ1ZVxuICAgICAgICBuZXh0QnV0dG9uOiAgJyNzd2lwZXJJbmRleCAuaWNvbi1yaWdodCdcbiAgICAgICAgcHJldkJ1dHRvbjogJyNzd2lwZXJJbmRleCAuaWNvbi1sZWZ0J1xuICAgICAgICBzbGlkZXNQZXJWaWV3OiAxXG4gICAgICAgIGVmZmVjdDogJ2ZhZGUnXG4gICAgICAgIHNwZWVkOiAxMDAwXG4gICAgICAgIHBhZ2luYXRpb25DbGlja2FibGU6IHRydWVcbiAgICAgIH0pXG5cbiAgICAgIHNsaWRlclRpbWVyID0gbmV3IFRpbWVySW50ZXJ2YWwgKCktPlxuICAgICAgICBzd2lwZXJJbmRleC51cGRhdGUodHJ1ZSlcbiAgICAgICAgc3dpcGVySW5kZXguc2xpZGVOZXh0KClcbiAgICAgICwgJCgnI3N3aXBlckluZGV4JykuZGF0YSgnc2xpZGVyVGltZW91dCcpXG5cbiAgICAgIHNsaWRlclRpbWVyQXV0b3BsYXkgPSBudWxsXG4gICAgICAkKCcjc2VydmljZVRhYnMgLnRhYiwgI3N3aXBlckluZGV4JykuaG92ZXIoXG4gICAgICAgIC0+XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHNsaWRlclRpbWVyQXV0b3BsYXkpIGlmIHNsaWRlclRpbWVyQXV0b3BsYXlcbiAgICAgICAgICBzbGlkZXJUaW1lckF1dG9wbGF5ID0gc2V0VGltZW91dCAoKSAtPlxuICAgICAgICAgICAgc2xpZGVyVGltZXIucGF1c2UoKVxuICAjICAgICAgICAgIGNvbnNvbGUubG9nKCdlbmQnKVxuICAgICAgICAgICwgMTAwXG4gICAgICAgICwtPlxuICAgICAgICAgIHNsaWRlclRpbWVyQXV0b3BsYXkgPSBzZXRUaW1lb3V0ICgpIC0+XG4gICAgICAgICAgICBzbGlkZXJUaW1lci5yZXN1bWUoKVxuICAjICAgICAgICAgIGNvbnNvbGUubG9nKCdzdGFydCcpXG4gICAgICAgICAgLCAxMDBcbiAgICAgIClcblxuICAgICAgJCgnI3NlcnZpY2VUYWJzIC50YWInKS5lcSgwKS5hZGRDbGFzcyAnaG92ZXInXG4gICAgICBzd2lwZXJJbmRleC5vbiAnc2xpZGVDaGFuZ2VTdGFydCcsICAoKS0+XG4gICAgICAgIGluZGV4ID0gc3dpcGVySW5kZXguYWN0aXZlSW5kZXggLSAxXG4gICAgICAgIGluZGV4ID0gMCBpZihpbmRleCA9PSA4KVxuICAjICAgICAgY29uc29sZS5sb2coaW5kZXgpXG4gICAgICAgICQoJyNzZXJ2aWNlVGFicyAudGFiJykucmVtb3ZlQ2xhc3MgJ2hvdmVyJ1xuICAgICAgICAkKCcjc2VydmljZVRhYnMgLnRhYicpLmVxKGluZGV4KS5hZGRDbGFzcyAnaG92ZXInXG5cbiAgICAgIHNsaWRlclRpbWVySG92ZXIgPSBudWxsXG4gICAgICAkKCcjc2VydmljZVRhYnMgLnRhYicpLmhvdmVyIC0+XG4gICAgICAgIGNsZWFyVGltZW91dChzbGlkZXJUaW1lckhvdmVyKSBpZiBzbGlkZXJUaW1lckhvdmVyXG4gICAgICAgIHNsaWRlclRpbWVySG92ZXIgPSBzZXRUaW1lb3V0KCAoKSA9PlxuICAgICAgICAgIHN3aXBlckluZGV4LnNsaWRlVG8oICQoQCkuaW5kZXgoKSArIDEpXG4gICAgICAgICwgJCgnI3N3aXBlckluZGV4JykuZGF0YSgnc2xpZGVyVGltZW91dEhvdmVyJykpXG5cbiNlbmRyZWdpb25cblxuI3JlZ2lvbiAgIHdoeSB1c1xuICAgIHRyYW5zZm9ybSA9IChhLCBiKSAtPlxuICAgICAgIyBzZXQgdGhlIHN0YWdlIHNvIHJhbWpldCBjb3BpZXMgdGhlIHJpZ2h0IHN0eWxlcy4uLlxuICAgICAgYi5jbGFzc0xpc3QucmVtb3ZlICdoaWRkZW4nXG4gICAgICByYW1qZXQudHJhbnNmb3JtIGEsIGIsIGRvbmU6IC0+XG4gICAgICAgICMgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgYXMgc29vbiBhcyB0aGUgdHJhbnNpdGlvbiBjb21wbGV0ZXNcbiAgICAgICAgYi5jbGFzc0xpc3QucmVtb3ZlICdoaWRkZW4nXG4gICAgICAgIGlmKCQoYSkuaGFzQ2xhc3MoJ3doeXVzLWludHJvJykpXG4gICAgICAgICAgJCgnLndoeXVzJykuY3NzKCdtaW4taGVpZ2h0JywgJChiKS5maW5kKCcucm93JykuaW5uZXJIZWlnaHQoKSArIDIwKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgJCgnLndoeXVzJykuY3NzKCdtaW4taGVpZ2h0JywgJycpXG4gICAgICAjIC4uLnRoZW4gaGlkZSB0aGUgb3JpZ2luYWwgZWxlbWVudHMgZm9yIHRoZSBkdXJhdGlvbiBvZiB0aGUgdHJhbnNpdGlvblxuICAgICAgYS5jbGFzc0xpc3QuYWRkICdoaWRkZW4nXG4gICAgICBiLmNsYXNzTGlzdC5hZGQgJ2hpZGRlbidcblxuICAgICQoJy53aHl1cy1pbnRybycpLmNsaWNrIC0+IHRyYW5zZm9ybShALCBALm5leHRTaWJsaW5nKVxuICAgICQoJy53aHl1cy1kZXRhaWwnKS5jbGljayAtPiB0cmFuc2Zvcm0oQCwgQC5wcmV2aW91c1NpYmxpbmcpXG4jZW5kcmVnaW9uXG5cbiNyZWdpb24gICBsaWdodGJveCBmb3JtXG4gICAgJC5mbi5zZXJpYWxpemVPYmplY3QgPSAtPlxuICAgICAgbyA9IHt9XG4gICAgICBhID0gQHNlcmlhbGl6ZUFycmF5KClcbiAgICAgICQuZWFjaCBhLCAtPlxuICAgICAgICBpZiBvW0BuYW1lXSAhPSB1bmRlZmluZWRcbiAgICAgICAgICBpZiAhb1tAbmFtZV0ucHVzaFxuICAgICAgICAgICAgb1tAbmFtZV0gPSBbIG9bQG5hbWVdIF1cbiAgICAgICAgICBvW0BuYW1lXS5wdXNoIEB2YWx1ZSBvciAnJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgb1tAbmFtZV0gPSBAdmFsdWUgb3IgJydcbiAgICAgICAgcmV0dXJuXG4gICAgICBvXG4gICAgbWFnbmlmaWNQb3B1cCA9ICQubWFnbmlmaWNQb3B1cC5pbnN0YW5jZVxuICAgICQoJy5idG4tcG9wdXAnKS5tYWduaWZpY1BvcHVwXG4gICAgICB0eXBlOiAnaW5saW5lJ1xuICAgICAgcHJlbG9hZGVyOiBmYWxzZVxuICAgICAgZm9jdXM6ICcjaW5wdXROYW1lJ1xuICAgICAgcmVtb3ZhbERlbGF5OiA1MDBcbiAgICAgIG1haW5DbGFzczogJ21mcC1tb3ZlLWZyb20tdG9wJ1xuICAgICQoJyNpbnB1dERhdGUnKS5kYXRlcGlja2VyKFxuICAgICAgbGFuZ3VhZ2U6ICdydSdcbiAgICAgIG9yaWVudGF0aW9uOiAnYm90dG9tJ1xuICAgIClcbiAgICAkcG9wdXBGb3JtID0gJCgnLnBvcHVwLWZvcm0nKVxuICAgICRwb3B1cEZvcm0udmFsaWRhdG9yKCkub24gJ3N1Ym1pdCcsIChlKSAtPlxuICAgICAgaWYgZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKVxuICAgICAgICBjb25zb2xlLmxvZygndmFsaWRhdGlvbiBmYWlsJylcbiAgICAgIGVsc2VcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICR0YXJnZXQgPSAkKGUudGFyZ2V0KVxuICAgICAgICBmb3JtRGF0YUFyciA9ICR0YXJnZXQuc2VyaWFsaXplQXJyYXkoKVxuICAgICAgICBmb3JtTWVzc2FnZSA9ICc8dGFibGUgY2VsbHNwYWNpbmc9XCIwXCIgY2VsbHBhZGRpbmc9XCIxMFwiIGJvcmRlcj1cIjBcIiB3aWR0aD1cIjEwMCVcIj48dGJvZHk+J1xuICAgICAgICBmb3JtRGF0YUFyci5mb3JFYWNoIChlbGVtZW50KSAtPlxuICAgICAgICAgIGZvcm1NZXNzYWdlID0gZm9ybU1lc3NhZ2UuY29uY2F0IFwiPHRyPlxuICAgICAgICAgICAgICA8dGQgYWxpZ249J3JpZ2h0JyB2YWxpZ249J3RvcCcgc3R5bGU9J3BhZGRpbmc6NXB4IDVweCA1cHggMDsnIHdpZHRoPScyMDAnPiA8c3Ryb25nPiAje2VsZW1lbnQubmFtZX06PC9zdHJvbmc+IDwvdGQ+XG4gICAgICAgICAgICAgIDx0ZCBhbGlnbj0nbGVmdCcgdmFsaWduPSd0b3AnIHN0eWxlPSdwYWRkaW5nOjVweCA1cHggNXB4IDA7JyB3aWR0aD0nKic+ICN7ZWxlbWVudC52YWx1ZX08L3RkPlxuICAgICAgICAgICAgPC90cj4gXCIgaWYgZWxlbWVudC5uYW1lICE9ICdfc3ViamVjdCdcbiAgICAgICAgZm9ybU1lc3NhZ2UgPSBmb3JtTWVzc2FnZS5jb25jYXQgJzwvdGJvZHk+PC90YWJsZT4nXG4gICAgICAgIGZvcm1EYXRhID0gJHRhcmdldC5zZXJpYWxpemVPYmplY3QoKVxuICAgICAgICBmb3JtRGF0YVsnZW1haWwnXSA/PSAnaW5mb0BnaWxkaWEtY2F0ZXJpbmcucnUnXG4gICAgICAgICQuYWpheFxuICAgICAgICAgIHR5cGU6ICdQT1NUJ1xuICAgICAgICAgIHVybDogJ2h0dHBzOi8vbWFuZHJpbGxhcHAuY29tL2FwaS8xLjAvbWVzc2FnZXMvc2VuZC5qc29uJ1xuICAgICAgICAgIGRhdGE6XG4gICAgICAgICAgICBrZXk6ICdFS1pMOHQzdWhLdnFtVDVHeDNyel93J1xuICAgICAgICAgICAgbWVzc2FnZTpcbiAgICAgICAgICAgICAgZnJvbV9lbWFpbDogZm9ybURhdGFbJ2VtYWlsJ11cbiAgICAgICAgICAgICAgZnJvbV9uYW1lOiBmb3JtRGF0YVsn0JLQsNGI0LUg0LjQvNGPJ11cbiAgICAgICAgICAgICAgaGVhZGVyczpcbiAgICAgICAgICAgICAgICAnUmVwbHktVG8nOiBmb3JtRGF0YVsnZW1haWwnXVxuICAgICAgICAgICAgICBodG1sOiBmb3JtTWVzc2FnZVxuICAgICAgICAgICAgICBzdWJqZWN0OiBmb3JtRGF0YVsnX3N1YmplY3QnXVxuICAgICAgICAgICAgICB0bzogW1xuICAgICAgICAgICAgICAgIGVtYWlsOiAnaW5mb0BnaWxkaWEtY2F0ZXJpbmcucnUnXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgICAgICQoJyNwb3B1cC1hbGVydC1zdWNjZXNzJykubWFnbmlmaWNQb3B1cChpdGVtczpcbiAgICAgICAgICAgICAgc3JjOiAnI3BvcHVwLWFsZXJ0LXN1Y2Nlc3MnXG4gICAgICAgICAgICAgIHR5cGU6ICdpbmxpbmUnKS5tYWduaWZpY1BvcHVwICdvcGVuJ1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKS0+XG4gICAgICAgICAgICAgIGUudGFyZ2V0LnJlc2V0KClcbiAgICAgICAgICAgICAgbWFnbmlmaWNQb3B1cC5jbG9zZSgpXG4gICAgICAgICAgICAsIDcwMClcbiAgICAgICAgICBlcnJvcjogKHhociwgc3RyKSAtPlxuICAgICAgICAgICAgY29uc29sZS5lcnJvcih4aHIpXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKHN0cilcbiAgICAgICAgICAgIGFsZXJ0KCfQktC+0LfQvdC40LrQu9CwINC+0YjQuNCx0LrQsDogJyArIHhoci5yZXNwb25zZUNvZGUpXG4jZW5kcmVnaW9uXG5cbiNyZWdpb24gICAjYnRuIHNjcm9sbCB0b3BcbiAgICAkKCcjYnRuLXRvcCcpLmFmZml4XG4gICAgICBvZmZzZXQ6XG4gICAgICAgIHRvcDogNTAwXG4gICAgICAgIGJvdHRvbTogMjAwXG4gICAgJCgnI2J0bi10b3AnKS5vbiAnY2xpY2snLCAoZSktPlxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAkKCdib2R5LGh0bWwnKS5hbmltYXRlXG4gICAgICAgICAgc2Nyb2xsVG9wOiAwXG4gICAgICAgICwgNzAwXG4jZW5kcmVnaW9uXG5cbiNyZWdpb24gICBsaWdodGJveCBpbWFnZXMgZ2FsbGVyeVxuICAgIGxpZ2h0Ym94SW1hZ2VzID0gKHNsZWN0b3IpIC0+XG4gICAgICAkKHNsZWN0b3IpLm1hZ25pZmljUG9wdXBcbiAgICAgICAgZGVsZWdhdGU6ICdhJ1xuICAgICAgICB0eXBlOiAnaW1hZ2UnXG4gICAgICAgIGNsb3NlT25Db250ZW50Q2xpY2s6IGZhbHNlXG4gICAgICAgIGNsb3NlQnRuSW5zaWRlOiBmYWxzZVxuICAgICAgICBtYWluQ2xhc3M6ICdtZnAtd2l0aC16b29tIG1mcC1pbWctbW9iaWxlJ1xuICAgICAgICBpbWFnZTpcbiAgICAgICAgICB2ZXJ0aWNhbEZpdDogdHJ1ZVxuICAgICAgICBnYWxsZXJ5OiBlbmFibGVkOiB0cnVlXG4gICAgICAgIHpvb206XG4gICAgICAgICAgZW5hYmxlZDogdHJ1ZVxuICAgICAgICAgIGR1cmF0aW9uOiAzMDBcbiAgICAgICAgICBvcGVuZXI6IChlbGVtZW50KSAtPlxuICAgICAgICAgICAgZWxlbWVudC5maW5kICdpbWcnXG4jZW5kcmVnaW9uXG5cbiNyZWdpb24gICBncGhvdG8gaW1hZ2VzIGdyaWRcbiAgICAkLmZuLmdwaG90by5wcm92aWRlclsnZ2dyaWQnXSA9XG4gICAgICBmaWx0ZXI6IChpbWFnZVVybCwgaW1hZ2UpIC0+XG4gICAgICAgIGltYWdlVXJsOiBpbWFnZVVybFxuICAgICAgICBkYXRhOiBpbWFnZVxuICAgICAgaW5zZXJ0OiAoJGxpbmssIGltYWdlcykgLT5cbiAgICAgICAgJGdncmlkID0gJCgnPGRpdiBjbGFzcz1cImdncmlkXCI+PC9kaXY+JylcbiAgICAgICAgb3B0aW9ucyA9IGRhdGE6IGltYWdlc1xuICAgICAgICBpZiAkbGluay5hdHRyKFwidGl0bGVcIik/XG4gICAgICAgICAgb3B0aW9uc1sndGVtcGxhdGUnXSA9ICAkbGluay5hdHRyKFwidGl0bGVcIilcbiAgICAgICAgJGxpbmsucmVwbGFjZVdpdGgoJGdncmlkKVxuICAgICAgICAkZ2dyaWQuZ2dyaWQgJC5leHRlbmQgb3B0aW9ucywgQFxuICAgICAgICBsaWdodGJveEltYWdlcyhcIi5nZ3JpZFwiKSBpZiBALmxpZ2h0Ym94XG5cbiAgICAkKCdhLmdwaG90by1nZ3JpZC1saWdodGJveCcpLmdwaG90byhcbiAgICAgIHByb3ZpZGVyOiAnZ2dyaWQnXG4gICAgICBjb2x1bW5zOiAzXG4gICAgICBtYXhXaWR0aDogMTE3MFxuICAgICAgcGFkZGluZzogNVxuICAgICAgbGlnaHRib3g6IHRydWVcbiAgICApXG5cbiAgICAkKCdhLmdwaG90by1nZ3JpZC1hYm91dCcpLmdwaG90byhcbiAgICAgIHByb3ZpZGVyOiAnZ2dyaWQnXG4gICAgICBjb2x1bW5zOiAyXG4gICAgICBtYXhXaWR0aDogODAwXG4gICAgICBwYWRkaW5nOiA1XG4gICAgICB0ZW1wbGF0ZTogJzEtMi0yJ1xuICAgICAgbGlnaHRib3g6IHRydWVcbiAgICApXG4jZW5kcmVnaW9uXG5cbiNyZWdpb24gZ3Bob3RvIGdhbGxlcnlcbiAgICAkLmZuLmdwaG90by5wcm92aWRlclsnc3dpcGVyJ10gPVxuICAgICAgZmlsdGVyOiAoaW1hZ2VVcmwsIGltYWdlKS0+XG4gICAgICAgIGltYWdlOiBcIiN7aW1hZ2VVcmx9LyN7QC5pbWFnZVNpemV9L1wiXG4gICAgICAgIHRodW1iOiBcIiN7aW1hZ2VVcmx9LyN7QC50aHVtYlNpemV9L1wiXG4gICAgICBpbnNlcnQ6ICgkbGluaywgaW1hZ2VzKS0+XG4gICAgICAgICRzd2lwZXIgPSAkKCc8ZGl2IGNsYXNzPVwic3dpcGVyLWNvbnRhaW5lclwiPjwvZGl2PicpXG4gICAgICAgICRzd2lwZXJXcmFwcGVyID0gJCgnPGRpdiBjbGFzcz1cInN3aXBlci13cmFwcGVyXCI+PC9kaXY+JylcbiAgICAgICAgJC5lYWNoKGltYWdlcywgKGluZGV4LCBlbGVtZW50KS0+XG4gICAgICAgICAgJHN3aXBlcldyYXBwZXIuYXBwZW5kKFxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3dpcGVyLXNsaWRlXCI+XG4gICAgICAgICAgICAgICA8YSBocmVmPVwiI3tlbGVtZW50LmltYWdlfVwiIGRhdGEtZWZmZWN0PVwibWZwLXpvb20taW5cIj5cbiAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiI3tlbGVtZW50LnRodW1ifVwiIGNsYXNzPVwiaW1nLXJlc3BvbnNpdmVcIi8+XG4gICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICAgJHN3aXBlci5hcHBlbmQoJHN3aXBlcldyYXBwZXIpXG4gICAgICAgICRzd2lwZXIuYWRkQ2xhc3MoQC5jb250YWluZXJDbGFzcylcbiAgICAgICAgJGxpbmsucmVwbGFjZVdpdGgoJHN3aXBlcilcbiAgICAgICAgYnRuQ250clNlbGVjdG9yID0gJGxpbmsuZGF0YShcImJ1dHRvbkNvbnRhaW5lclwiKVxuICAgICAgICBzd2lwZXIgPSAgbmV3IFN3aXBlcigkc3dpcGVyLCBqUXVlcnkuZXh0ZW5kKEAuc3dpcGVyLCB7XG4gICAgICAgICAgbmV4dEJ1dHRvbjogXCIje2J0bkNudHJTZWxlY3Rvcn0gLnN3aXBlci1idXR0b24tbmV4dFwiXG4gICAgICAgICAgcHJldkJ1dHRvbjogXCIje2J0bkNudHJTZWxlY3Rvcn0gLnN3aXBlci1idXR0b24tcHJldlwiXG4gICAgICAgIH0pKVxuICAgICAgICBzd2lwZXIuc2xpZGVUbygxLCAwKVxuICAgICAgICBsaWdodGJveEltYWdlcyhcIi4je0AuY29udGFpbmVyQ2xhc3N9XCIpXG5cbiAgICAkKCdhLnN3aXBlci1saW5rLWdhbGxlcnknKS5ncGhvdG8oXG4gICAgICBwcm92aWRlcjogJ3N3aXBlcidcbiAgICAgIGltYWdlU2l6ZTogJ3cxNjAwJ1xuICAgICAgdGh1bWJTaXplOiAndzMwMC1oMzAwLWMnXG4gICAgICBjb250YWluZXJDbGFzczogJ3N3aXBlci1nYWxsZXJ5J1xuICAgICAgc3dpcGVyOlxuICAgICAgICBwYWdpbmF0aW9uQ2xpY2thYmxlOiB0cnVlXG4gICAgICAgIGVmZmVjdDogJ2NvdmVyZmxvdydcbiAgICAgICAgZ3JhYkN1cnNvcjogdHJ1ZVxuICAgICAgICBjZW50ZXJlZFNsaWRlczogZmFsc2VcbiAgICAgICAgc2xpZGVzUGVyVmlldzogJ2F1dG8nXG4gICAgICAgIGxvb3A6IHRydWVcbiAgICAgICAgbmV4dEJ1dHRvbjogICcjc3dpcGVyR2FsbGVyeUJ0biAuc3dpcGVyLWJ1dHRvbi1uZXh0J1xuICAgICAgICBwcmV2QnV0dG9uOiAnI3N3aXBlckdhbGxlcnlCdG4gLnN3aXBlci1idXR0b24tcHJldidcbiAgICAgICAgY292ZXJmbG93OlxuICAgICAgICAgIHJvdGF0ZTogNTBcbiAgICAgICAgICBzdHJldGNoOiAwXG4gICAgICAgICAgZGVwdGg6IDEwMFxuICAgICAgICAgIG1vZGlmaWVyOiAxXG4gICAgICAgICAgc2xpZGVTaGFkb3dzOiB0cnVlXG4gICAgKVxuXG4gICAgJCgnYS5zd2lwZXItbGluay1jYXJvdXNlbCcpLmdwaG90byhcbiAgICAgIHByb3ZpZGVyOiAnc3dpcGVyJ1xuICAgICAgaW1hZ2VTaXplOiAndzE2MDAnXG4gICAgICB0aHVtYlNpemU6ICd3MzAwLWgyMDAtYydcbiAgICAgIGNvbnRhaW5lckNsYXNzOiAnc3dpcGVyLWNhcm91c2VsJ1xuICAgICAgc3dpcGVyOlxuICAgICAgICBsb29wOiB0cnVlXG4gICAgICAgIG5leHRCdXR0b246ICAnI3N3aXBlckNhcm91c2VsQnRuIC5zd2lwZXItYnV0dG9uLW5leHQnXG4gICAgICAgIHByZXZCdXR0b246ICcjc3dpcGVyQ2Fyb3VzZWxCdG4gLnN3aXBlci1idXR0b24tcHJldidcbiAgICAgICAgc2xpZGVzUGVyVmlldzogNFxuICAgICAgICBzbGlkZXNQZXJHcm91cDogNFxuICAgICAgICBwYWdpbmF0aW9uQ2xpY2thYmxlOiB0cnVlXG4gICAgICAgIHNwYWNlQmV0d2VlbjogMjBcbiAgICApXG5cbiAgICAkKCdhLnN3aXBlci1saW5rLWFydGlzdHMnKS5ncGhvdG8oXG4gICAgICBwcm92aWRlcjogJ3N3aXBlcidcbiAgICAgIGltYWdlU2l6ZTogJ3cxNjAwJ1xuICAgICAgdGh1bWJTaXplOiAndzE1MC1oMTUwLWMnXG4gICAgICBjb250YWluZXJDbGFzczogJ3N3aXBlci1hcnRpc3RzJ1xuICAgICAgc3dpcGVyOlxuICAgICAgICBsb29wOiB0cnVlXG4gICAgICAgIG5leHRCdXR0b246ICAnI3N3aXBlckNhcm91c2VsQnRuIC5zd2lwZXItYnV0dG9uLW5leHQnXG4gICAgICAgIHByZXZCdXR0b246ICcjc3dpcGVyQ2Fyb3VzZWxCdG4gLnN3aXBlci1idXR0b24tcHJldidcbiAgICAgICAgc2xpZGVzUGVyVmlldzogM1xuICAgICAgICBzbGlkZXNQZXJHcm91cDogM1xuICAgICAgICBwYWdpbmF0aW9uQ2xpY2thYmxlOiB0cnVlXG4gICAgICAgIHNwYWNlQmV0d2VlbjogMTBcbiAgICApXG4gICAgJCgnI2FjY29yZGlvbiBhJykub25lICdjbGljaycsICgpLT5cbiAgICAgICQoQCkuY2xvc2VzdCgnLnBhbmVsJykuZmluZCgnLnN3aXBlci1jb250YWluZXInKS5lYWNoICgpLT5cbiAgICAgICAgc2V0VGltZW91dCAoKT0+XG4gICAgICAgICAgQC5zd2lwZXIudXBkYXRlKHRydWUpXG4gICAgICAgICwgMTAwXG4gICAgJCgnI2FjY29yZGlvbiAuZmEtYW5nbGUtbGVmdCcpLm9uICdjbGljaycsIChlKS0+XG4gICAgICAkKEApLnBhcmVudCgpLnBhcmVudCgpLmZpbmQoJy5zd2lwZXItY29udGFpbmVyJylbMF0uc3dpcGVyLnNsaWRlUHJldigpXG4gICAgJCgnI2FjY29yZGlvbiAuZmEtYW5nbGUtcmlnaHQnKS5vbiAnY2xpY2snLCAoZSktPlxuICAgICAgJChAKS5wYXJlbnQoKS5wYXJlbnQoKS5maW5kKCcuc3dpcGVyLWNvbnRhaW5lcicpWzBdLnN3aXBlci5zbGlkZU5leHQoKVxuIyAgICAkKCcjYWNjb3JkaW9uIC5wYW5lbC1oZWFkaW5nJykub24gJ2NsaWNrJywgKGUpLT5cbiMgICAgICBjb25zb2xlLmxvZygkKEApLmZpbmQoJ2EnKSlcbiMjICAgICAgJChAKS5maW5kKCdhJykudHJpZ2dlckhhbmRsZXIoJ2NsaWNrJylcbiNlbmRyZWdpb25cblxuI3JlZ2lvbiAgIENsaWVudHMgY2Fyb3VzZWxcbiAgICBzd2lwZXJDYXJvdXNlbCA9IG5ldyBTd2lwZXIoJy5zd2lwZXItY2Fyb3VzZWwnLCB7XG4gICAgICBsb29wOiB0cnVlXG4gICAgICBuZXh0QnV0dG9uOiAgJyNidG5DbGllbnRzIC5zd2lwZXItYnV0dG9uLW5leHQnXG4gICAgICBwcmV2QnV0dG9uOiAnI2J0bkNsaWVudHMgLnN3aXBlci1idXR0b24tcHJldidcbiAgICAgIHNsaWRlc1BlclZpZXc6IDRcbiAgICAgIHNsaWRlc1Blckdyb3VwOiA0XG4gICAgICBwYWdpbmF0aW9uQ2xpY2thYmxlOiB0cnVlXG4gICAgICBzcGFjZUJldHdlZW46IDIwXG4gICAgfSlcbiNlbmRyZWdpb25cblxuI3JlZ2lvbiAgIGZvb2QgdGFic1xuICAgICQoXCIjZm9vZCAubmF2LWJ0bnMtbWVudSBhXCIpLmNsaWNrKChlKS0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICQoQCkucGFyZW50KCkuZmluZCgnYScpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAkKEApLmFkZENsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAkKHRoaXMpLnRhYignc2hvdycpXG4gICAgKVxuICAgICQoJyNmb29kIC5uYXYtYnRucy1wZXJzb24gYScpLmNsaWNrKChlKS0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICQoQCkuY2xvc2VzdCgnLnRhYi1wYW5lJykuZmluZCgnLm5hdi1idG5zLXBlcnNvbiBhJykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICQoQCkuYWRkQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICQoQCkuY2xvc2VzdCgnLnRhYi1wYW5lJykuZmluZCgnLm5hdi1idG5zLXBlcnNvbiBhW2hyZWY9XCInKyQoQCkuYXR0cignaHJlZicpKydcIl0nKS5hZGRDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgJCh0aGlzKS50YWIoJ3Nob3cnKVxuICAgIClcbiAgICAkKCcjZm9vZCAubmF2LWJ0bnMtcGVyc29uOmhpZGRlbiBhOm50aC1jaGlsZCgxKScpLmNsaWNrKClcbiAgICAkKCcjZm9vZCAubmF2LWJ0bnMtbWVudSBhOmZpcnN0JykuY2xpY2soKVxuXG4gICAgJCgnI2Zvb2QgLnRhYmxlJykuZWFjaCgoKS0+XG4gICAgICAkKCd0ci50ZCcpLmZpbHRlcignOm9kZCcpLmFkZENsYXNzKCdldmVuJylcbiNlbmRyZWdpb25cblxuICApXG4pIGpRdWVyeVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9