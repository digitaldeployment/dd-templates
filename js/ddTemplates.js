// Define a module that works with CommonJS (Node/Babel) and AMD (RequireJS).
(function(factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else {
    module.exports = factory(require('jquery'));
  }
})(function($) {
  'use strict';

  var defaults = {
    photoGalleryPID: 107,
    behaviors: {
      relatedLinks: true,
      itemAppearsIn: true,
      fullNodeRelatedLinks: true,
      bundledReferringContent: true,
      lexiconGlossary: true,
      subtermOverviews: true,
      nodeMeta: true,
      imageCaptions: true,
      slideshowIcons: true,
      expandingDates: true
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
      return $(document.body, context).is('.n, .section-node');
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
          'itemAppearsIn',
          'fullNodeRelatedLinks',
          'bundledReferringContent'
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
          'expandingDates'
        ]
      };

      // Cycle through each behavior and only add it if it's enabled
      $.each(behaviors[view], function(i, behavior) {
        self.addEnabledBehavior(behavior);
      });

      return true;
    },
    /**
     * Helper class for theming related links sitewide.
     * @status DEPRECATED
     */
    relatedLinks: function() {},
    /**
     * Helper class for theming the appearing navigation block
     */
    itemAppearsIn: function(context) {
      var $appearingNav = $('.appearing-nav', context);
      var $links = $appearingNav.find('ul.links li');
      if (!$links.length) {
        $appearingNav.addClass('placeholder-block');
      }
    },
    /**
     * Sets the block to show if one or more links are found
     */
    fullNodeRelatedLinks: function(context) {
      var $nodeFields = $('#block-digitaldcore-node_fields',context);
      var $relatedLinks = $nodeFields.find('.node-links');
      var numLinks = $relatedLinks.find('.link-related, .link-file').length;

      if (!numLinks) {
        $relatedLinks.addClass('placeholder-block');
      }
    },
    /**
     * Hides the blocks if no content is present.
     */
    bundledReferringContent: function(context) {
      var $blocks = $('#block-digitaldcore-node_referring, #block-digitaldcore-node_bundled', context);
      $blocks.each(function() {
        var $block = $(this);
        var $nodes = $block.find('.node-teaser');
        if (!$nodes.length) {
          $block.addClass('placeholder-block');
        }
      });
    },
    /**
     * Finds the real last meta item and identifies node of visible meta info
     */
    nodeMeta: function(context) {
      var $nodes = $('.node', context);
      $nodes.each(function() {
        // Create a meta object
        var $node = $(this);
        var $meta = $node.find('.node-upper-meta');
        var $items = $meta.find('.meta-item');

        // Clean up last classname
        $items.removeClass('last');

        // Get all visible meta items
        var $visible = $items.map(function() {
          return $(this).css('display') !== 'none' ? this : null;
        });

        // Correctly identify last meta item and label node with the has-meta flag
        if ($visible.length) {
          $node.addClass('has-meta');
          $visible.filter(':last').addClass('last new-dd-templates-functionality');
        }
      });
    },
    /**
     * If there is more than two event dates, functionality is added to show and
     * hide all events within one container.
     *
     * Helps cleans up the look of meta data.
     *
     * @note:
     *   This is only enabled for blocks with the 'posts' classname and all
     *   full post views
     */
    expandingDates: function(context) {
      $('.posts .node, .node-full', context).each(function(i, node) {
        var $meta = $('.node-meta, .node-upper-meta', node);
        $meta.each(function(i, meta) {
          var $meta = $(meta);
          var $dates = $('.event-date', node);
          if ($dates.length > 2) {
            // Create and add functionality to display all other dates
            var $link = $('<a class="meta-item all-dates-link" href="#">Show all dates</a>');
            $link.bind('click', function(event) {
              event.preventDefault();
              $meta.toggleClass('show-all-dates');
              $(this).text(
                $meta.is('.show-all-dates')
                  ? 'Hide all dates'
                  : 'Show all dates'
              );
            });
            $link.insertBefore($dates.eq(0));

            // Move all other dates
            var $container = $('<div class="all-dates"></div>');
            $dates.appendTo($container);
            $meta.append($container);
          }
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
        var caption = $image.attr('title');
        // Continue processing this title isn't an empty string
        if (caption.length) {
          var $field = $image.parents('.field-image');
          var $link = $field.find('a');
          // delete the existing caption if it exists
          $field.find('.caption').remove();
          // Add a helper class for theming
          $field.addClass('has-caption');
          // Add the caption to the link
          $link.append('<span class="caption">' + caption + '</span>');
          // Sets the container link a maximum width so the caption doesn't expand
          // bigger than the image width
          //var imgWidth = $image.attr('width');
          //if (imgWidth && imgWidth > 0) {
          //  $link.css('max-width', imgWidth + 'px');
          //}
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
     * Helper function to theme the category letters and seperate the sections
     */
    lexiconGlossary: function(context) {
      $('#glossary', context).find('.lexicon-list > a').each(function() {
        var letter = $(this).attr('id').replace('letter_', '');
        $(this).html(letter.toUpperCase());
      });
    }
  };

  return DDTemplates;

});
