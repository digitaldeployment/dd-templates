define(['jquery'], function($) {

  var defaults = {
    photoGalleryPID: 107,
    behaviors: {
      fullNodeRelatedLinks: true,
      bundledReferringContent: true,
      fullNodeRelocateContactInfo: true,
      lexiconGlossary: true,
      subtermOverviews: true,
      nodeMeta: true,
      relatedLinks: true,
      imageCaptions: true,
      slideshowIcons: true,
      tableZebraStrips: true,
      ieClearColumnRows: true,
      firstVisibleNavterm: true,
      moveUpperMetaAboveUpperImage: true
    }
  };

  var DDTemplates = function(context, options) {
    this.context = context;
    this._defaults = defaults;
    this.isNodeView = this.isNode(context);
    this.settings = $.extend(true, defaults, options);
    this.init();
  };

  DDTemplates.prototype = {
    init: function() {
      var context = this.context;
      var view = this.isNodeView ? 'node' : 'term';
      // Global behaviors
      this.defineApplicableBehaviors('global', context);
      // Current view behaviors only
      this.defineApplicableBehaviors(view, context);
    },
    /**
     * Simple check to see if the current body element contains the node class.
     */
    isNode: function(context) {
      return $(document.body, context).is('.n');
    },
    /**
     * A way to enable only behaviors the theme requires.
     */
    addEnabledBehavior: function(behavior) {
      var enabled = this.settings.behaviors[behavior];
      if (enabled) {
        this[behavior](this.context);
      }
      return true;
    },
    /**
     * Segregates behaviors by different types of common views. If they're
     * enabled, define them in this module.
     */
    defineApplicableBehaviors: function(view) {
      var self = this;
      var behaviors = {
        node: [
          'fullNodeRelatedLinks',
          'bundledReferringContent',
          'fullNodeRelocateContactInfo'
        ],
        term: [
          'lexiconGlossary',
          'subtermOverviews'
        ],
        global: [
          'nodeMeta',
          'relatedLinks',
          'imageCaptions',
          'slideshowIcons',
          'tableZebraStrips',
          'ieClearColumnRows',
          'firstVisibleNavterm',
          'moveUpperMetaAboveUpperImage'
        ]
      };

      // Cycle through each behavior and only add it if it's enabled
      $.each(behaviors[view], function(i, behavior) {
        self.addEnabledBehavior(behavior);
      });

      return true;
    },
    /**
     * Creates a header for the node full related links section if there are related
     * links present. This behavior also adds accordion type functionality to links
     * appearing in the node-sidebar if certain conditions are met.
     */
    fullNodeRelatedLinks: function(context) {
      var $nodeFull = $('#node-full', context),
          $nodeFields = $('#block-digitaldcore-node_fields', context),
          $relatedLinks = $nodeFull.find('.node-links'),
          $blockTitle = $nodeFields.find('.block-title'),
          $titleText = $blockTitle.find('.block-title-text'),
          numLinks = $relatedLinks.find('.link-related, .link-file').length,
          title = $titleText.text();

      // Set the default title if one doesn't exist already, if it does, use that
      if (!title.length) {
        $titleText.text('Related Links');
      }

      // Add a Related Links block title to the node links
      $relatedLinks.prepend($blockTitle.clone());

      if (numLinks) {
        // Add a helper class to the blocks to control block title display
        $nodeFull.addClass('has-links');
        $nodeFields.addClass('has-links');
      }

      /**
       * Enable expanding links only if the classname has been passed to the block
       * @info: Manually add this classname to the #block-digitaldcore-node_fields
       *        block on the admin/dd/dd_classes configuration page
       * @example: global|block-digitaldcore-node_fields>expanding-links
       */
      if ($nodeFields.is('.expanding-links')) {

        // Wait until images load before checking the height of the full node
        $(window).bind('load.ddTemplatesFullNodeRelatedLinks', function(event) {

          // Adds accordion style behavior to pages with little content and
          // contain 3 or more links
          if ($nodeFull.height() <= 600 || numLinks >= 3) {
            var $bt = $nodeFields.find('.block-title'),
                $nodeLinks = $nodeFields.find('.node-links'),
                $link = $('<a href="#"></a>'),
                $icon = $('<i class="icon"></i>'),
                $text = $('<span class="link-text">' + title + '</span>'),
                $numLink = $('<span class="num-links">(' + numLinks + ')</span>');

            // Create an accordion heading instance to control the display of the
            // related links
            $text.append($numLink);
            $link.append($icon, $text);
            $bt.addClass('accordion-heading').html($link);

            // hide the links to start things off
            $nodeLinks.hide();

            // Click handler to control the display of the related links
            $bt.click(function(event) {
              event.preventDefault();
              var isActive = $blockTitle.is('.active');
              // collapse links
              if (isActive) {
                $blockTitle.removeClass('active');
                $nodeLinks.stop(true,true).animate({opacity: 'hide', height: 'hide'}, 250);
              }
              // expand links
              else {
                $blockTitle.addClass('active');
                $nodeLinks.stop(true,true).animate({opacity: 'show', height: 'show'}, 500);
              }
            });
          }
        });
      }
    },
    /**
     * Hides the blocks if no content is present.
     */
    bundledReferringContent: function(context) {
      var $blocks = $('#block-digitaldcore-node_referring, #block-digitaldcore-node_bundled', context);
      $blocks.each(function() {
        var $block = $(this),
            $nodes = $block.find('.node-teaser');
        if (!$nodes.length) {
          $block.addClass('placeholder-block');
        }
      });
    },
    /**
     * Reposition contact information appearing in the node-sidebar to be below the
     * related links.
     */
    fullNodeRelocateContactInfo: function(context) {
      var $contactInfo = $('#node-sidebar .node-contact', context),
          $nodeLinks = $('#node-sidebar .node-links', context);
      $contactInfo.insertAfter($nodeLinks);
    },
    /**
     * Always have node upper meta at the very top of the node markup if node upper
     * image position is used.
     * TODO: Move this to a site setting controlling the node render of all teasers
     */
    moveUpperMetaAboveUpperImage: function(context) {
      var $upperImages = $('.node .node-upper-image', context);
      $upperImages.each(function() {
        var $node = $(this).parents('.node'),
            $upperMeta = $node.find('.node-upper-meta');
        $(this).insertAfter($upperMeta);
      });
    },
    /**
     * Finds the real last meta item and identifies node of visible meta info
     */
    nodeMeta: function(context) {
      var $nodes = $('.node', context);
      $nodes.each(function() {
        // Create a meta object
        var $node = $(this),
            $meta = $node.find('.node-upper-meta'),
            $items = $meta.find('.meta-item'),
            $visible = $items.filter(':visible');

        // Clean up last classname
        $items.removeClass('last');

        // Correctly identify last meta item and label node with the has-meta flag
        if ($visible.length) {
          $node.addClass('has-meta');
          $visible.filter(':last').addClass('last');
        }
      });
    },
    /**
     * Helper class for theming related links sitewide.
     */
    relatedLinks: function(context) {
      var $nodes = $('.node', context);
      $nodes.each(function() {
        var $links = $(this).find('.link-related, .link-file');
        $links.each(function() {
          var $link = $(this).find('a');
          // wrap contents within a container
          $link.wrapInner('<span class="link-text-wrapper"></span>');
          // add an icon
          $link.prepend('<i class="icon"></i>');
        });
      });
    },
    /**
     * Field image caption control
     */
    imageCaptions: function(context) {
      // Identifies an image that should have a caption added
      $('.field-image img[title]', context).each(function() {
        var $image = $(this);
        var $field = $image.parents('.field-image');
        var $link = $field.find('a');
        // delete the existing caption if it exists
        $field.find('.caption').remove();
        // Add a helper class for theming
        $field.addClass('has-caption');
        // Add the caption to the link
        $link.append('<span class="caption">' + $image.attr('title') + '</span>');
        // Sets the container link a maximum width so the caption doesn't expand
        // bigger than the image width
        var imgWidth = $image.attr('width');
        if (imgWidth && imgWidth > 0) {
          $link.css('max-width', imgWidth + 'px');
        }
      });
    },
    /**
     * Adds markup to slideshow teasers to show an icon overlay
     */
    slideshowIcons: function(context) {
      var $slideshowNodes = $('.pt' + this.settings.photoGalleryPID + '.node-teaser', context);
      // cycle through each node instance
      $slideshowNodes.each(function() {
        var $images = $(this).find('.field-image');
        // cycle through each field image instance
        $images.each(function() {
          var $img = $(this).find('img');
          // add a button helper classname
          $(this).find('a').addClass('slideshow-btn');
          // prepend the icon overlay
          $img.before('<i class="slideshow-icon"></i>');
        });
      });

    },
    /**
     * Adds the has more class to subterm overviews to properly control node-link display
     */
    subtermOverviews: function(context) {
      $('.subterm-overview .node-teaser', context).removeClass('no-more').addClass('has-more');
    },
    /**
     * Figure out first visible navigation term and add a classname for proper theme
     */
    firstVisibleNavterm: function(context) {
      $('.navbar a.depth-1', context).not('.hidden').filter(':first').addClass(
        'first-visible'
      );
    },
    /**
     * Helper function to theme the category letters and seperate the sections
     */
    lexiconGlossary: function(context) {
      $('#glossary', context).find('.lexicon-list > a').each(function() {
        var letter = $(this).attr('id').replace('letter_', '');
        $(this).html(letter.toUpperCase());
      });
    },
    /**
     * Adds odd and even row classes to tables paving the way for proper theming in
     * addition to adding cross browser support since the :nth-child() pseudo
     * selector isn't available in IE 8
     */
    tableZebraStrips: function(context) {
      $('.node-content table', context).each(function() {
        var $table = $(this);
        $table.find('tr').removeClass('odd even');
        $table.find('tr:nth-child(odd)').addClass('odd');
        $table.find('tr:nth-child(even)').addClass('even');
      });
    },
    /**
     * Adds IE specific classnames for clearing rows of various column grids which
     * since the :nth-child() pseudo selector isn't available in IE 8
     */
    ieClearColumnRows: function(context) {
      if ($(document).is('ie-8')) {
        var selectors =
          '.col-1 .views-row,' +
            '.col-2 .views-row:nth-child(2n+1),' +
            '.col-3 .views-row:nth-child(3n+1),' +
            '.col-4 .views-row:nth-child(4n+1),' +
            '.col-5 .views-row:nth-child(5n+1),' +
            '.col-6 .views-row:nth-child(6n+1)';
        $(selectors, context).addClass('clear-row');
      }
    }
  };

  return DDTemplates;

});
