import $ from 'jquery';

const defaults = {
  photoGalleryPID: 107,
  behaviors: {
    itemAppearsIn: true,
    fullNodeRelatedLinks: true,
    bundledReferringContent: true,
    overviews: true,
    subtermOverviews: true,
    lexiconGlossary: true,
    nodeMeta: true,
    imageCaptions: true,
    slideshowIcons: true,
    expandingDates: true,
  },
};

export default class DDTemplates {
  constructor(context, options) {
    this.context = context;
    this.isNodeView = this.isNode();
    this.settings = Object.assign({}, defaults, options);
    // Global behaviors
    this.defineApplicableBehaviors('global', this.context);
    // Current view behaviors only
    this.defineApplicableBehaviors(this.isNodeView ? 'node' : 'term', this.context);
  }

  /**
   * Simple check to see if the current body element contains the node class.
   */
  isNode() {
    return $(document.body, this.context).is('.n, .section-node');
  }

  /**
   * Segregates behaviors by different types of common views. If they're
   * enabled, define them in this module.
   */
  defineApplicableBehaviors(view) {
    const behaviors = {
      node: [
        'itemAppearsIn',
        'fullNodeRelatedLinks',
        'bundledReferringContent',
      ],
      term: [
        'overviews',
        'subtermOverviews',
        'lexiconGlossary',
      ],
      global: [
        'nodeMeta',
        'imageCaptions',
        'slideshowIcons',
        'expandingDates',
      ],
    };

    // Cycle through each behavior and only add it if it's enabled
    behaviors[view].forEach((behavior) => {
      this.addEnabledBehavior(behavior);
    });
  }

  /**
   * A way to enable only behaviors the theme requires.
   */
  addEnabledBehavior(behavior) {
    const enabled = this.settings.behaviors[behavior];
    if (enabled) {
      this[behavior].call(this);
    }
  }

  /**
   * Helper class for theming the appearing navigation block
   */
  itemAppearsIn() {
    const $appearingNav = $('.appearing-nav', this.context);
    const $links = $appearingNav.find('ul.links li');
    if (!$links.length) {
      $appearingNav.addClass('placeholder-block');
    }
  }

  /**
   * Sets the block to show if one or more links are found
   */
  fullNodeRelatedLinks() {
    const $nodeFields = $('#block-digitaldcore-node_fields', this.context);
    const $relatedLinks = $nodeFields.find('.node-links');
    const numLinks = $relatedLinks.find('.link-related, .link-file').length;

    if (!numLinks) {
      $relatedLinks.addClass('placeholder-block');
    }
  }

  /**
   * Hides the blocks if no content is present.
   */
  bundledReferringContent() {
    const $blocks = $('#block-digitaldcore-node_referring, #block-digitaldcore-node_bundled', this.context);
    $blocks.each((i, element) => {
      const $block = $(element);
      const $nodes = $block.find('.node-teaser');
      if (!$nodes.length) {
        $block.addClass('placeholder-block');
      }
    });
  }

  /**
   * Finds the real last meta item and identifies node of visible meta info
   */
  nodeMeta() {
    const $nodes = $('.node', this.context);
    $nodes.each((a, node) => {
      // Create a meta object
      const $node = $(node);
      const $meta = $node.find('.node-upper-meta');
      const $items = $meta.find('.meta-item');

      // Clean up last classname
      $items.removeClass('last');

      // Filter to just visible items
      const $visible = $items.map((i, item) => {
        const props = window.getComputedStyle(item);
        const display = props.getPropertyValue('display');
        return display !== 'none' ? item : null;
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
    $('.posts .node, .node-full', this.context).each((a, node) => {
      $('.node-meta, .node-upper-meta', node).each((b, meta) => {
        const $meta = $(meta);
        const $dates = $('.event-date', node);

        if ($dates.length > 2) {
          // Create and add functionality to display all other dates
          const $link = $('<a class="meta-item all-dates-link" href="#">Show all dates</a>');
          $link.bind('click', (event) => {
            event.preventDefault();
            $meta.toggleClass('show-all-dates');
            $(event.currentTarget).text($meta.is('.show-all-dates') ? 'Hide all dates' : 'Show all dates');
          });
          $link.insertBefore($dates.eq(0));

          // Move all other dates
          const $container = $('<div class="all-dates"></div>');
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
    $('.field-image img[title]', this.context).each((i, element) => {
      const $image = $(element);
      const title = $image.attr('title');
      // Continue processing this title isn't an empty string
      if (title.length) {
        const $field = $image.parents('.field-image');
        const caption = `<span class="caption">${title}</span>`;
        const $wrapper = $field.find('a');

        // delete the existing caption if it exists
        $field.find('.caption').remove();

        // Add image as a link support
        $image.after(caption);

        if (!$wrapper.length) {
          $field.find('img, .caption').wrapAll('<span />');
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
    const $slideshowNodes = $(`.pt${this.settings.photoGalleryPID}.node-teaser`, this.context);
    // cycle through each node instance
    $slideshowNodes.each((a, element) => {
      const $images = $(element).find('.field-image');
      // cycle through each field image instance
      $images.each((b, image) => {
        const $img = $(image).find('img');
        // add a button helper classname
        $(image).find('a').addClass('slideshow-btn');
        // prepend the icon overlay
        $img.before('<i class="slideshow-icon"></i>');
      });
    });
  }

  /**
   * Removes the link from overview headings.
   */
  overviews() {
    const $context = $(this.context);
    if ($context.length) {
      $context.find('.overview .node-header a').children().unwrap();
    }
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
    $('#glossary', this.context).find('.lexicon-list > a').each((i, element) => {
      const letter = $(element).attr('id').replace('letter_', '');
      $(element).html(letter.toUpperCase());
    });
  }
}
