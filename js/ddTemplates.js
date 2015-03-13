define(['jquery'], function($) {

  var defaults = {
    photoGalleryPID: 107,
    behaviors: {
      relatedLinks: true,
      fullNodeRelatedLinks: true,
      bundledReferringContent: true,
      lexiconGlossary: true,
      subtermOverviews: true,
      nodeMeta: true,
      imageCaptions: true,
      slideshowIcons: true,
      tableZebraStrips: true
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
          'tableZebraStrips'
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
     * Sets the block to show if one or more links are found
     */
    fullNodeRelatedLinks: function(context) {
      var $nodeFields = $('#block-digitaldcore-node_fields',context);
      var $relatedLinks = $nodeFields.find('.node-links');
      var numLinks = $relatedLinks.find('.link-related, .link-file').length;

      if (numLinks) {
        $relatedLinks.addClass('has-links');
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
        // TODO: Work on if this is necessary or not anymore?
        // Maybe do a IE only check instead if that's the only damn browser that doesn't display the caption correctly
        //var imgWidth = $image.attr('width');
        //if (imgWidth && imgWidth > 0) {
        //  $link.css('max-width', imgWidth + 'px');
        //}
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
    }
  };

  return DDTemplates;

});
