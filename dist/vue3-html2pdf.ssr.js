'use strict';Object.defineProperty(exports,'__esModule',{value:true});var html2pdf=require('html2pdf.js'),vue=require('vue');function _interopDefaultLegacy(e){return e&&typeof e==='object'&&'default'in e?e:{'default':e}}var html2pdf__default=/*#__PURE__*/_interopDefaultLegacy(html2pdf);var script = {
  props: {
    showLayout: {
      type: Boolean,
      default: false,
    },

    floatLayout: {
      type: Boolean,
      default: true,
    },

    enableDownload: {
      type: Boolean,
      default: true,
    },

    previewModal: {
      type: Boolean,
      default: false,
    },

    paginateElementsByHeight: {
      type: Number,
    },

    filename: {
      type: String,
      default: ("" + (new Date().getTime())),
    },

    pdfQuality: {
      type: Number,
      default: 2,
    },

    pdfFormat: {
      default: 'a4',
    },

    pdfOrientation: {
      type: String,
      default: 'portrait',
    },

    pdfContentWidth: {
      default: '800px',
    },

    htmlToPdfOptions: {
      type: Object,
    },

    manualPagination: {
      type: Boolean,
      default: false,
    },
  },

  data: function data() {
    return {
      hasAlreadyParsed: false,
      progress: 0,
      pdfWindow: null,
      pdfFile: null,
    }
  },

  watch: {
    progress: function progress(val) {
      this.$emit('progress', val);
    },

    paginateElementsByHeight: function paginateElementsByHeight() {
      this.resetPagination();
    },

    $props: {
      handler: function handler() {
        this.validateProps();
      },

      deep: true,
      immediate: true,
    },
  },

  methods: {
    validateProps: function validateProps() {
      // If manual-pagination is false, paginate-elements-by-height props is required
      if (!this.manualPagination) {
        if (this.paginateElementsByHeight === undefined) {
          console.error(
            'Error: paginate-elements-by-height is required if manual-pagination is false'
          );
        }
      }
    },

    resetPagination: function resetPagination() {
      var parentElement = this.$refs.pdfContent; // .firstChild
      var pageBreaks = parentElement.getElementsByClassName(
        'html2pdf__page-break'
      );
      var pageBreakLength = pageBreaks.length - 1;

      if (pageBreakLength === -1) { return }

      this.hasAlreadyParsed = false;

      // Remove All Page Break (For Pagination)
      for (var x = pageBreakLength; x >= 0; x--) {
        pageBreaks[x].parentNode.removeChild(pageBreaks[x]);
      }
    },

    generatePdf: function generatePdf() {
      this.$emit('startPagination');
      this.progress = 0;
      this.paginationOfElements();
    },

    paginationOfElements: function paginationOfElements() {
      this.progress = 25;

      /* When this props is true, the props paginate-elements-by-height will not be used. Instead the pagination process will rely on the elements with a class "html2pdf__page-break" to know where to page break, which is automatically done by html2pdf.js */
      if (this.manualPagination) {
        this.progress = 70;
        this.$emit('hasPaginated');
        this.downloadPdf();
        return
      }

      if (!this.hasAlreadyParsed) {
        var parentElement = this.$refs.pdfContent; // .firstChild
        var ArrOfContentChildren = Array.from(this.$refs.pdfContent.children);

        var childrenHeight = 0;

        /* Loop through Elements and add there height with childrenHeight variable. Once the childrenHeight is >= this.paginateElementsByHeight, create a div with a class named 'html2pdf__page-break' and insert the element before the element that will be in the next page */
        for (var childElement of ArrOfContentChildren) {
          // Get The First Class of the element
          var elementFirstClass = childElement.classList[0];
          var isPageBreakClass = elementFirstClass === 'html2pdf__page-break';
          if (isPageBreakClass) {
            childrenHeight = 0;
          } else {
            // Get Element Height
            var elementHeight = childElement.clientHeight;

            // Get Computed Margin Top and Bottom
            var elementComputedStyle =
              childElement.currentStyle || window.getComputedStyle(childElement);
            var elementMarginTopBottom =
              parseInt(elementComputedStyle.marginTop) +
              parseInt(elementComputedStyle.marginBottom);

            // Add Both Element Height with the Elements Margin Top and Bottom
            var elementHeightWithMargin =
              elementHeight + elementMarginTopBottom;

            if (
              childrenHeight + elementHeight <
              this.paginateElementsByHeight
            ) {
              childrenHeight += elementHeightWithMargin;
            } else {
              var section = document.createElement('div');
              section.classList.add('html2pdf__page-break');
              parentElement.insertBefore(section, childElement);

              // Reset Variables made the upper condition false
              childrenHeight = elementHeightWithMargin;
            }
          }
        }

        this.progress = 70;

        /* Set to true so that if would generate again we wouldn't need to parse the HTML to paginate the elements */
        this.hasAlreadyParsed = true;
      } else {
        this.progress = 70;
      }

      this.$emit('hasPaginated');
      this.downloadPdf();
    },

    downloadPdf: async function downloadPdf() {
      // Set Element and Html2pdf.js Options
      var pdfContent = this.$refs.pdfContent;
      var options = this.setOptions();

      this.$emit('beforeDownload', { html2pdf: html2pdf__default["default"], options: options, pdfContent: pdfContent });

      var html2PdfSetup = html2pdf__default["default"]().set(options).from(pdfContent);
      var pdfBlobUrl = null;

      if (this.previewModal) {
        this.pdfFile = await html2PdfSetup.output('bloburl');
        pdfBlobUrl = this.pdfFile;
      }

      if (this.enableDownload) {
        pdfBlobUrl = await html2PdfSetup.save().output('bloburl');
      }

      if (pdfBlobUrl) {
        var res = await fetch(pdfBlobUrl);
        var blobFile = await res.blob();
        this.$emit('hasDownloaded', blobFile);
      }

      this.progress = 100;
    },

    setOptions: function setOptions() {
      if (
        this.htmlToPdfOptions !== undefined &&
        this.htmlToPdfOptions !== null
      ) {
        return this.htmlToPdfOptions
      }

      return {
        margin: 0,

        filename: ((this.filename) + ".pdf"),

        image: {
          type: 'jpeg',
          quality: 0.98,
        },

        enableLinks: false,

        html2canvas: {
          scale: this.pdfQuality,
          useCORS: true,
        },

        jsPDF: {
          unit: 'in',
          format: this.pdfFormat,
          orientation: this.pdfOrientation,
        },
      }
    },

    closePreview: function closePreview() {
      this.pdfFile = null;
    },
  },
};var _hoisted_1 = { class: "vue-html2pdf" };
var _hoisted_2 = {
  key: 0,
  class: "pdf-preview"
};
var _hoisted_3 = ["src"];

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", _hoisted_1, [
    vue.createElementVNode("section", {
      class: vue.normalizeClass(["layout-container", {
        'show-layout': $props.showLayout,
        'unset-all': !$props.floatLayout,
      }])
    }, [
      vue.createElementVNode("section", {
        class: "content-wrapper",
        style: vue.normalizeStyle(("width: " + ($props.pdfContentWidth) + ";")),
        ref: "pdfContent"
      }, [
        vue.renderSlot(_ctx.$slots, "pdf-content")
      ], 4)
    ], 2),
    vue.createVNode(vue.Transition, { name: "transition-anim" }, {
      default: vue.withCtx(function () { return [
        ($data.pdfFile)
          ? (vue.openBlock(), vue.createElementBlock("section", _hoisted_2, [
              vue.createElementVNode("button", {
                onClick: _cache[0] || (_cache[0] = vue.withModifiers(function ($event) { return ($options.closePreview()); }, ["self"]))
              }, "×"),
              vue.createElementVNode("iframe", {
                src: $data.pdfFile,
                width: "100%",
                height: "100%"
              }, null, 8, _hoisted_3)
            ]))
          : vue.createCommentVNode("", true)
      ]; }),
      _: 1
    })
  ]))
}script.render = render;// Import vue component
// install function executed by Vue.use()
function install(Vue) {
  if (install.installed) { return; }
  install.installed = true;
  Vue.component('Vue3Html2pdf', script);
}

// Create module definition for Vue.use()
var plugin = {
  install: install,
};

// To auto-install when vue is found
/* global window global */
var GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

// Inject install function into component - allows component
// to be registered via Vue.use() as well as Vue.component()
script.install = install;

// It's possible to expose named exports when writing components that can
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = component;
exports["default"]=script;