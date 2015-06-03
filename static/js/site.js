(function($) {
  return $.fn.extend({
    gphoto: function(options) {
      var provider, settings;
      settings = {
        provider: {
          name: 'fotorama'
        }
      };
      settings = $.extend(settings, options);
      provider = {
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
            }, settings.provider));
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
            var $ggrid;
            $ggrid = $('<div class="ggrid"></div>');
            options = {
              data: images
            };
            if ($link.attr("title") != null) {
              options['template'] = $link.attr("title");
            }
            $link.replaceWith($ggrid);
            $ggrid.ggrid($.extend(options, settings.provider));
            $ggrid.find('a').fluidbox();
          }
        }
      };
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
            if (settings.filter) {
              return settings.filter(imageUrl, image);
            } else {
              return provider[settings.provider.name].filter(imageUrl, image);
            }
          });
          if (settings.insert) {
            settings.insert($link, images);
          } else {
            provider[settings.provider.name].insert($link, images);
          }
        });
      });
    }
  });
})(jQuery);

(function($) {
  return $(function() {
    var TimerInterval, sliderTimerHover, swiperCarousel, transform;
    console.log("DOM is ready");
    $('.dropdown-full').hover(function() {
      if (!$(this).hasClass('open')) {
        return $(this).find('.dropdown-toggle').dropdown('toggle');
      }
    }, function() {
      if ($(this).hasClass('open')) {
        return $(this).find('.dropdown-toggle').dropdown('toggle');
      }
    });
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
    $('#serviceTabs a:first').tab('show');
    sliderTimerHover = null;
    $('#serviceTabs .tab').hover(function() {
      if (sliderTimerHover) {
        clearTimeout(sliderTimerHover);
      }
      return sliderTimerHover = setTimeout((function(_this) {
        return function() {
          return $(_this).tab('show');
        };
      })(this), $('#serviceSlider').data('sliderTimeoutHover'));
    });
    $('#serviceSlider .icon-right').click(function() {
      var $next;
      $next = $('#serviceTabs .active').next().find('a');
      if (!$next.length) {
        $next = $('#serviceTabs a:first');
      }
      return $next.tab('show');
    });
    $('#serviceSlider .icon-left').click(function() {
      var $next;
      $next = $('#serviceTabs .active').prev().find('a');
      if (!$next.length) {
        $next = $('#serviceTabs a:last');
      }
      return $next.tab('show');
    });
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
    $('.hypher').hyphenate('ru');
    $('a.swiper-link-gallery').gphoto({
      filter: function(imageUrl, image) {
        return {
          img: imageUrl + "/w1200/",
          thumb: imageUrl + "/w300-h300-c/"
        };
      },
      insert: function($link, images) {
        var $swiper, $swiperWrapper, swiperGallery;
        $swiper = $('<div class="swiper-gallery swiper-container"></div>');
        $swiperWrapper = $('<div class="swiper-wrapper"></div>');
        $.each(images, function(index, element) {
          return $swiperWrapper.append('<div class="swiper-slide"> <a href="' + element.img + '" data-effect="mfp-zoom-in"> <img src="' + element.thumb + '" alt=""/> </a> </div>');
        });
        $swiper.append($swiperWrapper);
        $swiper.append('<div class="swiper-button-prev swiper-button-black"></div> <div class="swiper-button-next swiper-button-black"></div>');
        $link.replaceWith($swiper);
        swiperGallery = new Swiper('.swiper-gallery', {
          loop: true,
          nextButton: '.swiper-button-next',
          prevButton: '.swiper-button-prev',
          effect: 'coverflow',
          grabCursor: true,
          centeredSlides: true,
          slidesPerView: 'auto',
          coverflow: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true
          }
        });
        return $('.swiper-gallery').magnificPopup({
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
      }
    });
    swiperCarousel = new Swiper('.swiper-carousel', {
      pagination: '.swiper-pagination',
      nextButton: '.swiper-button-next',
      prevButton: '.swiper-button-prev',
      slidesPerView: 6,
      paginationClickable: true,
      spaceBetween: 30
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
    $('.nav-btns-person:hidden a:nth-child(1)').click();
    $('#food .nav-btns-menu a:first').click();
    return $('.table').each(function() {
      return $('tr.td').filter(':odd').addClass('even');
    });
  });
})(jQuery);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpxdWVyeS5ncGhvdG8uY29mZmVlIiwic2l0ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBQyxTQUFDLENBQUQsR0FBQTtTQUNDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTCxDQUNFO0FBQUEsSUFBQSxNQUFBLEVBQVEsU0FBQyxPQUFELEdBQUE7QUFDTixVQUFBLGtCQUFBO0FBQUEsTUFBQSxRQUFBLEdBQ0U7QUFBQSxRQUFBLFFBQUEsRUFDRTtBQUFBLFVBQUEsSUFBQSxFQUFNLFVBQU47U0FERjtPQURGLENBQUE7QUFBQSxNQUlBLFFBQUEsR0FBVyxDQUFDLENBQUMsTUFBRixDQUFTLFFBQVQsRUFBbUIsT0FBbkIsQ0FKWCxDQUFBO0FBQUEsTUFNQSxRQUFBLEdBQ0U7QUFBQSxRQUFBLFFBQUEsRUFDRTtBQUFBLFVBQUEsTUFBQSxFQUFRLFNBQUMsUUFBRCxFQUFXLEtBQVgsR0FBQTttQkFDTjtBQUFBLGNBQUEsR0FBQSxFQUFRLFFBQUQsR0FBVSxLQUFqQjtBQUFBLGNBQ0EsS0FBQSxFQUFVLFFBQUQsR0FBVSxVQURuQjtjQURNO1VBQUEsQ0FBUjtBQUFBLFVBR0EsTUFBQSxFQUFRLFNBQUMsS0FBRCxFQUFRLE1BQVIsR0FBQTtBQUNOLGdCQUFBLFNBQUE7QUFBQSxZQUFBLFNBQUEsR0FBWSxDQUFBLENBQUUsOEJBQUYsQ0FBWixDQUFBO0FBQUEsWUFDQSxLQUFLLENBQUMsV0FBTixDQUFrQixTQUFsQixDQURBLENBQUE7QUFBQSxZQUVBLFNBQVMsQ0FBQyxRQUFWLENBQW1CLENBQUMsQ0FBQyxNQUFGLENBQVM7QUFBQSxjQUFBLElBQUEsRUFBTSxNQUFOO2FBQVQsRUFBdUIsUUFBUSxDQUFDLFFBQWhDLENBQW5CLENBRkEsQ0FETTtVQUFBLENBSFI7U0FERjtBQUFBLFFBU0EsS0FBQSxFQUNFO0FBQUEsVUFBQSxNQUFBLEVBQVEsU0FBQyxRQUFELEVBQVcsS0FBWCxHQUFBO21CQUNOO0FBQUEsY0FBQSxRQUFBLEVBQVUs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LE1BR0EsQ0FBQSxDQUFFLElBQUYsQ0FBSSxDQUFDLE9BQUwsQ0FBYSxXQUFiLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsMkJBQUEsR0FBNEIsQ0FBQSxDQUFFLElBQUYsQ0FBSSxDQUFDLElBQUwsQ0FBVSxNQUFWLENBQTVCLEdBQThDLElBQTdFLENBQWtGLENBQUMsUUFBbkYsQ0FBNEYsVUFBNUYsQ0FIQSxDQUFBO2FBSUEsQ0FBQSxDQUFFLElBQUYsQ0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaLEVBTGtDO0lBQUEsQ0FBcEMsQ0F0SkEsQ0FBQTtBQUFBLElBNkpBLENBQUEsQ0FBRSx3Q0FBRixDQUEyQyxDQUFDLEtBQTVDLENBQUEsQ0E3SkEsQ0FBQTtBQUFBLElBOEpBLENBQUEsQ0FBRSw4QkFBRixDQUFpQyxDQUFDLEtBQWxDLENBQUEsQ0E5SkEsQ0FBQTtXQWdLQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsSUFBWixDQUFpQixTQUFBLEdBQUE7YUFDZixDQUFBLENBQUUsT0FBRixDQUFVLENBQUMsTUFBWCxDQUFrQixNQUFsQixDQUF5QixDQUFDLFFBQTFCLENBQW1DLE1BQW5DLEVBRGU7SUFBQSxDQUFqQixFQWpLQTtFQUFBLENBQUYsRUFERDtBQUFBLENBQUQsQ0FBQSxDQXNLRSxNQXRLRixDQUFBLENBQUEiLCJmaWxlIjoic2l0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIigoJCkgLT5cbiAgJC5mbi5leHRlbmRcbiAgICBncGhvdG86IChvcHRpb25zKSAtPlxuICAgICAgc2V0dGluZ3MgPVxuICAgICAgICBwcm92aWRlcjpcbiAgICAgICAgICBuYW1lOiAnZm90b3JhbWEnXG5cbiAgICAgIHNldHRpbmdzID0gJC5leHRlbmQgc2V0dGluZ3MsIG9wdGlvbnNcblxuICAgICAgcHJvdmlkZXIgPVxuICAgICAgICBmb3RvcmFtYTpcbiAgICAgICAgICBmaWx0ZXI6IChpbWFnZVVybCwgaW1hZ2UpIC0+XG4gICAgICAgICAgICBpbWc6IFwiI3tpbWFnZVVybH13MC9cIlxuICAgICAgICAgICAgdGh1bWI6IFwiI3tpbWFnZVVybH13NjQtaDY0L1wiXG4gICAgICAgICAgaW5zZXJ0OiAoJGxpbmssIGltYWdlcykgLT5cbiAgICAgICAgICAgICRmb3RvcmFtYSA9ICQoJzxkaXYgY2xhc3M9XCJmb3RvcmFtYVwiPjwvZGl2PicpXG4gICAgICAgICAgICAkbGluay5yZXBsYWNlV2l0aCgkZm90b3JhbWEpXG4gICAgICAgICAgICAkZm90b3JhbWEuZm90b3JhbWEgJC5leHRlbmQgZGF0YTogaW1hZ2VzLCBzZXR0aW5ncy5wcm92aWRlclxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGdncmlkOlxuICAgICAgICAgIGZpbHRlcjogKGltYWdlVXJsLCBpbWFnZSkgLT5cbiAgICAgICAgICAgIGltYWdlVXJsOiBpbWFnZVVybFxuICAgICAgICAgICAgZGF0YTogaW1hZ2VcbiAgICAgICAgICBpbnNlcnQ6ICgkbGluaywgaW1hZ2VzKSAtPlxuICAgICAgICAgICAgJGdncmlkID0gJCgnPGRpdiBjbGFzcz1cImdncmlkXCI+PC9kaXY+JylcbiAgICAgICAgICAgIG9wdGlvbnMgPSBkYXRhOiBpbWFnZXNcbiAgICAgICAgICAgIGlmICRsaW5rLmF0dHIoXCJ0aXRsZVwiKT9cbiAgICAgICAgICAgICAgb3B0aW9uc1sndGVtcGxhdGUnXSA9ICAkbGluay5hdHRyKFwidGl0bGVcIilcbiAgICAgICAgICAgICRsaW5rLnJlcGxhY2VXaXRoKCRnZ3JpZClcbiAgICAgICAgICAgICRnZ3JpZC5nZ3JpZCAkLmV4dGVuZCBvcHRpb25zLCBzZXR0aW5ncy5wcm92aWRlclxuICAgICAgICAgICAgJGdncmlkLmZpbmQoJ2EnKS5mbHVpZGJveCgpXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgIyBib2R5IHNjcmlwdFxuICAgICAgcmV0dXJuIEAuZmlsdGVyKFwiW2hyZWYgXj0gaHR0cHNcXFxcOlxcXFwvXFxcXC9wbHVzXFxcXC5nb29nbGVcXFxcLmNvbVxcXFwvcGhvdG9zXVwiKS5lYWNoICgpIC0+XG4gICAgICAgICRsaW5rID0gJChAKVxuICAgICAgICB1cmwgPSBuZXcgVVJJKCRsaW5rLmF0dHIoJ2hyZWYnKSlcbiAgICAgICAgdXNlcklkID0gdXJsLnNlZ21lbnQoMSlcbiAgICAgICAgYWxidW1JZCA9IHVybC5zZWdtZW50KDMpXG4gICAgICAgICQuZ2V0SlNPTihcbiAgICAgICAgICBcImh0dHBzOi8vcGljYXNhd2ViLmdvb2dsZS5jb20vZGF0YS9mZWVkL2FwaS91c2VyLyN7dXNlcklkfS9hbGJ1bWlkLyN7YWxidW1JZH0/a2luZD1waG90byZhY2Nlc3M9cHVibGljJmFsdD1qc29uLWluLXNjcmlwdCZjYWxsYmFjaz0/XCIsXG4gICAgICAgICAgKGRhdGEsIHN0YXR1cykgLT5cbiAgICAgICAgICAgIGltYWdlcyA9IGRhdGEuZmVlZC5lbnRyeS5tYXAgKGltYWdlKSAtPlxuICAgICAgICAgICAgICB1cmwgPSAgbmV3IFVSSShpbWFnZS5jb250ZW50LnNyYylcbiAgICAgICAgICAgICAgaW1hZ2VVcmwgPSBcIiN7dXJsLnByb3RvY29sKCl9Oi8vI3t1cmwuaG9zdCgpfSN7dXJsLmRpcmVjdG9yeSgpfVwiXG4gICAgICAgICAgICAgIGlmIHNldHRpbmdzLmZpbHRlclxuICAgICAgICAgICAgICAgIHNldHRpbmdzLmZpbHRlcihpbWFnZVVybCwgaW1hZ2UpXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBwcm92aWRlcltzZXR0aW5ncy5wcm92aWRlci5uYW1lXS5maWx0ZXIoaW1hZ2VVcmwsIGltYWdlKVxuXG4gICAgICAgICAgICBpZiBzZXR0aW5ncy5pbnNlcnRcbiAgICAgICAgICAgICAgc2V0dGluZ3MuaW5zZXJ0KCRsaW5rLCBpbWFnZXMpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHByb3ZpZGVyW3NldHRpbmdzLnByb3ZpZGVyLm5hbWVdLmluc2VydCgkbGluaywgaW1hZ2VzKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIClcbikgalF1ZXJ5XG4iLCIoKCQpIC0+XG4gICQgLT5cbiAgICBjb25zb2xlLmxvZyhcIkRPTSBpcyByZWFkeVwiKVxuIyAgIG1lbnVcbiAgICAkKCcuZHJvcGRvd24tZnVsbCcpLmhvdmVyKC0+XG4gICAgICBpZiAoISQoQCkuaGFzQ2xhc3MoJ29wZW4nKSlcbiAgICAgICAgJChAKS5maW5kKCcuZHJvcGRvd24tdG9nZ2xlJykuZHJvcGRvd24oJ3RvZ2dsZScpXG4gICAgLC0+XG4gICAgICBpZiAoJChAKS5oYXNDbGFzcygnb3BlbicpKVxuICAgICAgICAkKEApLmZpbmQoJy5kcm9wZG93bi10b2dnbGUnKS5kcm9wZG93bigndG9nZ2xlJylcbiAgICApXG4jICAgc2xpZGVyXG4gICAgVGltZXJJbnRlcnZhbCA9IChjYWxsYmFjaywgZGVsYXkpIC0+XG4gICAgICB0aW1lcklkID0gdW5kZWZpbmVkXG4gICAgICByZW1haW5pbmcgPSBkZWxheVxuICAgICAgQHBhdXNlID0gLT5cbiAgICAgICAgY2xlYXJUaW1lb3V0IHRpbWVySWRcbiAgICAgIEByZXN1bWUgPSAtPlxuICAgICAgICBjbGVhclRpbWVvdXQgdGltZXJJZFxuICAgICAgICB0aW1lcklkID0gc2V0SW50ZXJ2YWwoY2FsbGJhY2ssIHJlbWFpbmluZylcbiAgICAgIEByZXN1bWUoKVxuXG4gICAgJCgnI3NlcnZpY2VUYWJzIGE6Zmlyc3QnKS50YWIoJ3Nob3cnKVxuXG4jICAgIHNsaWRlclRpbWVyID0gbmV3IFRpbWVySW50ZXJ2YWwoKC0+XG4jICAgICAgJCgnI3NlcnZpY2VTbGlkZXIgLmljb24tcmlnaHQnKS5jbGljaygpXG4jICAgICksICQoJyNzZXJ2aWNlU2xpZGVyJykuZGF0YSgnc2xpZGVyVGltZW91dCcpKVxuXG4gICAgc2xpZGVyVGltZXJIb3ZlciA9IG51bGxcbiAgICAkKCcjc2VydmljZVRhYnMgLnRhYicpLmhvdmVyIC0+XG4gICAgICBjbGVhclRpbWVvdXQoc2xpZGVyVGltZXJIb3ZlcikgaWYgc2xpZGVyVGltZXJIb3ZlclxuICAgICAgc2xpZGVyVGltZXJIb3ZlciA9IHNldFRpbWVvdXQoICgpID0+XG4gICAgICAgICQoQCkudGFiICdzaG93J1xuICAgICAgLCAkKCcjc2VydmljZVNsaWRlcicpLmRhdGEoJ3NsaWRlclRpbWVvdXRIb3ZlcicpKVxuXG4jICAgICQoJyNzZXJ2aWNlVGFicyAudGFiLCAjc2VydmljZVNsaWRlcicpLmhvdmVyKFxuIyAgICAgIC0+XG4jICAgICAgICBzbGlkZXJUaW1lci5wYXVzZSgpXG4jICAgICAgLC0+XG4jICAgICAgICBzbGlkZXJUaW1lci5yZXN1bWUoKVxuIyAgICApXG5cblxuICAgICQoJyNzZXJ2aWNlU2xpZGVyIC5pY29uLXJpZ2h0JykuY2xpY2sgLT5cbiAgICAgICRuZXh0ID0gJCgnI3NlcnZpY2VUYWJzIC5hY3RpdmUnKS5uZXh0KCkuZmluZCgnYScpXG4gICAgICAkbmV4dCA9ICQoJyNzZXJ2aWNlVGFicyBhOmZpcnN0JykgaWYgKCEkbmV4dC5sZW5ndGgpXG4gICAgICAkbmV4dC50YWIgJ3Nob3cnXG4gICAgJCgnI3NlcnZpY2VTbGlkZXIgLmljb24tbGVmdCcpLmNsaWNrIC0+XG4gICAgICAkbmV4dCA9ICQoJyNzZXJ2aWNlVGFicyAuYWN0aXZlJykucHJldigpLmZpbmQoJ2EnKVxuICAgICAgJG5leHQgPSAkKCcjc2VydmljZVRhYnMgYTpsYXN0JykgaWYgKCEkbmV4dC5sZW5ndGgpXG4gICAgICAkbmV4dC50YWIgJ3Nob3cnXG5cblxuXG4gICAgdHJhbnNmb3JtID0gKGEsIGIpIC0+XG4gICAgICAjIHNldCB0aGUgc3RhZ2Ugc28gcmFtamV0IGNvcGllcyB0aGUgcmlnaHQgc3R5bGVzLi4uXG4gICAgICBiLmNsYXNzTGlzdC5yZW1vdmUgJ2hpZGRlbidcbiAgICAgIHJhbWpldC50cmFuc2Zvcm0gYSwgYiwgZG9uZTogLT5cbiAgICAgICAgIyB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBhcyBzb29uIGFzIHRoZSB0cmFuc2l0aW9uIGNvbXBsZXRlc1xuICAgICAgICBiLmNsYXNzTGlzdC5yZW1vdmUgJ2hpZGRlbidcbiAgICAgICAgaWYoJChhKS5oYXNDbGFzcygnd2h5dXMtaW50cm8nKSlcbiAgICAgICAgICAkKCcud2h5dXMnKS5jc3MoJ21pbi1oZWlnaHQnLCAkKGIpLmZpbmQoJy5yb3cnKS5pbm5lckhlaWdodCgpICsgMjApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAkKCcud2h5dXMnKS5jc3MoJ21pbi1oZWlnaHQnLCAnJylcbiAgICAgICMgLi4udGhlbiBoaWRlIHRoZSBvcmlnaW5hbCBlbGVtZW50cyBmb3IgdGhlIGR1cmF0aW9uIG9mIHRoZSB0cmFuc2l0aW9uXG4gICAgICBhLmNsYXNzTGlzdC5hZGQgJ2hpZGRlbidcbiAgICAgIGIuY2xhc3NMaXN0LmFkZCAnaGlkZGVuJ1xuXG4gICAgJCgnLndoeXVzLWludHJvJykuY2xpY2sgLT4gdHJhbnNmb3JtKEAsIEAubmV4dFNpYmxpbmcpXG4gICAgJCgnLndoeXVzLWRldGFpbCcpLmNsaWNrIC0+IHRyYW5zZm9ybShALCBALnByZXZpb3VzU2libGluZylcblxuICAgICQoJy5oeXBoZXInKS5oeXBoZW5hdGUoJ3J1JylcblxuIyAgIGdhbGxlcnlcbiAgICAkKCdhLnN3aXBlci1saW5rLWdhbGxlcnknKS5ncGhvdG8oXG4gICAgICBmaWx0ZXI6IChpbWFnZVVybCwgaW1hZ2UpLT5cbiAgICAgICAgaW1nOiBcIiN7aW1hZ2VVcmx9L3cxMjAwL1wiXG4gICAgICAgIHRodW1iOiBcIiN7aW1hZ2VVcmx9L3czMDAtaDMwMC1jL1wiXG4gICAgICBpbnNlcnQ6ICgkbGluaywgaW1hZ2VzKS0+XG4gICAgICAgICRzd2lwZXIgPSAkKCc8ZGl2IGNsYXNzPVwic3dpcGVyLWdhbGxlcnkgc3dpcGVyLWNvbnRhaW5lclwiPjwvZGl2PicpXG4gICAgICAgICRzd2lwZXJXcmFwcGVyID0gJCgnPGRpdiBjbGFzcz1cInN3aXBlci13cmFwcGVyXCI+PC9kaXY+JylcbiAgICAgICAgJC5lYWNoKGltYWdlcywgKGluZGV4LCBlbGVtZW50KS0+XG4gICAgICAgICAgJHN3aXBlcldyYXBwZXIuYXBwZW5kKFxuICAgICAgICAgICAgJ1xuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN3aXBlci1zbGlkZVwiPlxuICAgICAgICAgICAgICAgPGEgaHJlZj1cIicrZWxlbWVudC5pbWcrJ1wiIGRhdGEtZWZmZWN0PVwibWZwLXpvb20taW5cIj5cbiAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiJytlbGVtZW50LnRodW1iKydcIiBhbHQ9XCJcIi8+XG4gICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAnXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICAgICRzd2lwZXIuYXBwZW5kKCRzd2lwZXJXcmFwcGVyKVxuICAgICAgICAkc3dpcGVyLmFwcGVuZChcbiAgICAgICAgICAnXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInN3aXBlci1idXR0b24tcHJldiBzd2lwZXItYnV0dG9uLWJsYWNrXCI+PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInN3aXBlci1idXR0b24tbmV4dCBzd2lwZXItYnV0dG9uLWJsYWNrXCI+PC9kaXY+XG4gICAgICAgICAgJ1xuICAgICAgICApXG4gICAgICAgICRsaW5rLnJlcGxhY2VXaXRoKCRzd2lwZXIpXG5cbiAgICAgICAgc3dpcGVyR2FsbGVyeSA9IG5ldyBTd2lwZXIoJy5zd2lwZXItZ2FsbGVyeScsXG4gICAgICAgICAgbG9vcDogdHJ1ZVxuICAgICAgICAgIG5leHRCdXR0b246ICcuc3dpcGVyLWJ1dHRvbi1uZXh0J1xuICAgICAgICAgIHByZXZCdXR0b246ICcuc3dpcGVyLWJ1dHRvbi1wcmV2J1xuICAgICAgICAjICAgICAgc2Nyb2xsYmFyOiAnLnN3aXBlci1zY3JvbGxiYXInXG4gICAgICAgICMgICAgICBzcGVlZDogNDAwXG4gICAgICAgICMgICAgICBzcGFjZUJldHdlZW46IDEwMFxuICAgICAgICAgIGVmZmVjdDogJ2NvdmVyZmxvdydcbiAgICAgICAgICBncmFiQ3Vyc29yOiB0cnVlXG4gICAgICAgICAgY2VudGVyZWRTbGlkZXM6IHRydWVcbiAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAnYXV0bydcbiAgICAgICAgICBjb3ZlcmZsb3c6XG4gICAgICAgICAgICByb3RhdGU6IDUwXG4gICAgICAgICAgICBzdHJldGNoOiAwXG4gICAgICAgICAgICBkZXB0aDogMTAwXG4gICAgICAgICAgICBtb2RpZmllcjogMVxuICAgICAgICAgICAgc2xpZGVTaGFkb3dzOiB0cnVlXG4gICAgICAgIClcblxuICAgICAgICAjICAgbGlnaHRib3hcbiAgICAgICAgJCgnLnN3aXBlci1nYWxsZXJ5JykubWFnbmlmaWNQb3B1cFxuICAgICAgICAgIGRlbGVnYXRlOiAnYSdcbiAgICAgICAgICB0eXBlOiAnaW1hZ2UnXG4gICAgICAgICAgY2xvc2VPbkNvbnRlbnRDbGljazogZmFsc2VcbiAgICAgICAgICBjbG9zZUJ0bkluc2lkZTogZmFsc2VcbiAgICAgICAgICBtYWluQ2xhc3M6ICdtZnAtd2l0aC16b29tIG1mcC1pbWctbW9iaWxlJ1xuICAgICAgICAgIGltYWdlOlxuICAgICAgICAgICAgdmVydGljYWxGaXQ6IHRydWVcbiAgICAgICAgICBnYWxsZXJ5OiBlbmFibGVkOiB0cnVlXG4gICAgICAgICAgem9vbTpcbiAgICAgICAgICAgIGVuYWJsZWQ6IHRydWVcbiAgICAgICAgICAgIGR1cmF0aW9uOiAzMDBcbiAgICAgICAgICAgIG9wZW5lcjogKGVsZW1lbnQpIC0+XG4gICAgICAgICAgICAgIGVsZW1lbnQuZmluZCAnaW1nJ1xuICAgIClcblxuICAgIHN3aXBlckNhcm91c2VsID0gbmV3IFN3aXBlcignLnN3aXBlci1jYXJvdXNlbCcsIHtcbiAgICAgIHBhZ2luYXRpb246ICcuc3dpcGVyLXBhZ2luYXRpb24nXG4gICAgICBuZXh0QnV0dG9uOiAnLnN3aXBlci1idXR0b24tbmV4dCdcbiAgICAgIHByZXZCdXR0b246ICcuc3dpcGVyLWJ1dHRvbi1wcmV2J1xuICAgICAgc2xpZGVzUGVyVmlldzogNlxuICAgICAgcGFnaW5hdGlvbkNsaWNrYWJsZTogdHJ1ZVxuICAgICAgc3BhY2VCZXR3ZWVuOiAzMFxuICAgIH0pXG5cbiAgICAkKFwiI2Zvb2QgLm5hdi1idG5zLW1lbnUgYVwiKS5jbGljaygoZSktPlxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAkKEApLnBhcmVudCgpLmZpbmQoJ2EnKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgJChAKS5hZGRDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgJCh0aGlzKS50YWIoJ3Nob3cnKVxuICAgIClcbiAgICAkKCcjZm9vZCAubmF2LWJ0bnMtcGVyc29uIGEnKS5jbGljaygoZSktPlxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAkKEApLmNsb3Nlc3QoJy50YWItcGFuZScpLmZpbmQoJy5uYXYtYnRucy1wZXJzb24gYScpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAkKEApLmFkZENsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAkKEApLmNsb3Nlc3QoJy50YWItcGFuZScpLmZpbmQoJy5uYXYtYnRucy1wZXJzb24gYVtocmVmPVwiJyskKEApLmF0dHIoJ2hyZWYnKSsnXCJdJykuYWRkQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICQodGhpcykudGFiKCdzaG93JylcbiAgICApXG4gICAgJCgnLm5hdi1idG5zLXBlcnNvbjpoaWRkZW4gYTpudGgtY2hpbGQoMSknKS5jbGljaygpXG4gICAgJCgnI2Zvb2QgLm5hdi1idG5zLW1lbnUgYTpmaXJzdCcpLmNsaWNrKClcblxuICAgICQoJy50YWJsZScpLmVhY2goKCktPlxuICAgICAgJCgndHIudGQnKS5maWx0ZXIoJzpvZGQnKS5hZGRDbGFzcygnZXZlbicpXG4gICAgKVxuXG4pIGpRdWVyeVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9