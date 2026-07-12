export const SEO_CONTENT_TEMPLATE_TYPES = {
  SEO_FOOTER: "seo-footer",
  FAQ: "faq",
};

export const SEO_CONTENT_TEMPLATE_OPTIONS = [
  {
    id: SEO_CONTENT_TEMPLATE_TYPES.SEO_FOOTER,
    label: "SEO Footer",
    generatedTitle: "Generated SEO Footer",
    emptyMessage: "Your SEO Footer HTML will appear here.",
  },
  {
    id: SEO_CONTENT_TEMPLATE_TYPES.FAQ,
    label: "FAQ",
    generatedTitle: "Generated FAQ",
    emptyMessage: "Your FAQ HTML will appear here.",
  },
];

export const DEFAULT_FAQ_HEADING = "Frequently Asked Questions";

export const DEFAULT_FAQ_SETTINGS = {
  heading: DEFAULT_FAQ_HEADING,
};

export const FAQ_STYLE = `<style>
  .accordion__panel p {
    text-align: left;
  }

  .tab {
    margin: 10px 0;
  }

  .tab-label {
    display: block;
    position: relative;
    cursor: pointer;
    padding: 1rem 2.5rem 1rem 1.25rem;
    background: #f7f7f7;
    font-size: 14px;
    list-style: none;
  }

  .tab-label::-webkit-details-marker {
    display: none;
  }

  .tab-label::before,
  .tab-label::after {
    content: '';
    width: .75em;
    height: 0;
    border-bottom: 1px solid;
    position: absolute;
    top: calc(50% - 1px);
    right: 1.25rem;
  }

  .tab-label::after {
    transform: rotate(90deg);
    transition: transform 200ms;
  }

  .tab[open] > .tab-label::after {
    transform: rotate(0deg);
  }

  .accordion__panel {
    height: 0;
    overflow: hidden;
    padding: 0 1.25rem;
    transition: height 0.35s ease, padding 0.35s ease;
  }
</style>`;

export const FAQ_SCRIPT = `<script>
  document.querySelectorAll('.accordion details').forEach((details) => {
    const summary = details.querySelector('summary');
    const panel = details.querySelector('.accordion__panel');

    if (!summary || !panel) return;

    summary.addEventListener('click', (event) => {
      event.preventDefault();

      if (details.open) {
        panel.style.height = panel.scrollHeight + 'px';

        requestAnimationFrame(() => {
          panel.style.height = '0px';
          panel.style.padding = '0 1.25rem';
        });

        panel.addEventListener(
          'transitionend',
          function onTransitionEnd() {
            details.open = false;
          },
          { once: true },
        );

        return;
      }

      details.open = true;
      panel.style.height = '0px';
      panel.style.padding = '0 1.25rem';

      requestAnimationFrame(() => {
        panel.style.height = panel.scrollHeight + 'px';
        panel.style.padding = '1rem 1.25rem';
      });
    });
  });
</script>`;