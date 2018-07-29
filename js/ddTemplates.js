import $ from 'jquery';

const defaults = {
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

export default class DDTemplates {
  constructor(context, options) {
    this.context = context;
    this.isNodeView = this.isNode(context);
    this.settings = Object.assign(defaults, options);
    // Global behaviors
    this.defineApplicableBehaviors('global', this.context);
    // Current view behaviors only
    this.defineApplicableBehaviors(this.isNodeView ? 'node' : 'term', this.context);
  }

  /**
   * Simple check to see if the current body element contains the node class.
   */
  isNode(context) {
    return $(document.body, context).is('.n, .section-node');
  }

  /**
   * A way to enable only behaviors the theme requires.
   */
  addEnabledBehavior(behavior) {
    var enabled = this.settings.behaviors[behavior];
    if (enabled) {
      this[behavior]();
    }
    return true;
  }

  /**
   * Segregates behaviors by different types of common views. If they're
   * enabled, define them in this module.
   */
  defineApplicableBehaviors(view) {
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
  }

  /**
   * Helper class for theming related links sitewide.
   * @status DEPRECATED
   */
  relatedLinks() {}

  /**
   * Helper class for theming the appearing navigation block
   */
  itemAppearsIn() {
    var $appearingNav = $('.appearing-nav', this.context);
    var $links = $appearingNav.find('ul.links li');
    if (!$links.length) {
      $appearingNav.addClass('placeholder-block');
    }
  }

  /**
   * Sets the block to show if one or more links are found
   */
  fullNodeRelatedLinks() {
    var $nodeFields = $('#block-digitaldcore-node_fields', this.context);
    var $relatedLinks = $nodeFields.find('.node-links');
    var numLinks = $relatedLinks.find('.link-related, .link-file').length;

    if (!numLinks) {
      $relatedLinks.addClass('placeholder-block');
    }
  }

  /**
   * Hides the blocks if no content is present.
   */
  bundledReferringContent() {
    var $blocks = $('#block-digitaldcore-node_referring, #block-digitaldcore-node_bundled', context);
    $blocks.each(function() {
      var $block = $(this);
      var $nodes = $block.find('.node-teaser');
      if (!$nodes.length) {
        $block.addClass('placeholder-block');
      }
    });
  }

  /**
   * Finds the real last meta item and identifies node of visible meta info
   */
  nodeMeta() {
    var $nodes = $('.node', this.context);
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
  }

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
  expandingDates() {
    $('.posts .node, .node-full', this.context).each(function(i, node) {
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
  }

  /**
   * Field image caption control
   */
  imageCaptions() {
    // Identifies an image that should have a caption added
    $('.field-image img[title]', this.context).each(function() {
      var $image = $(this);
      var caption = $image.attr('title');
      // Continue processing this title isn't an empty string
      if (caption.length) {
        var $field = $image.parents('.field-image');
        var $wrapper = $field.find('a');
        var $caption = $('<span class="caption">' + caption + '</span>');

        // delete the existing caption if it exists
        $field.find('.caption').remove();

        // Add image as a link support
        $caption.insertAfter($image);

        if (!$wrapper.length) {
          $field.find('img, .caption').wrapAll('<span />');
          $wrapper = $field.children('span');
        }

        // Add a helper class to aid styling of the image and caption
        $field.addClass('has-caption');
      }
    });
  }

  /**
   * Adds markup to slideshow teasers to show an icon overlay
   */
  slideshowIcons() {
    var $slideshowNodes = $('.pt' + this.settings.photoGalleryPID + '.node-teaser', this.context);
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

  }

  /**
   * Adds the has more class to subterm overviews to properly control node-link display
   */
  subtermOverviews() {
    $('.subterm-overview .node-teaser', this.context).removeClass('no-more').addClass('has-more');
  }

  /**
   * Helper function to theme the category letters and seperate the sections
   */
  lexiconGlossary() {
    $('#glossary', this.context).find('.lexicon-list > a').each(function() {
      var letter = $(this).attr('id').replace('letter_', '');
      $(this).html(letter.toUpperCase());
    });
  }
}
