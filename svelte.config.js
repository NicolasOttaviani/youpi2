const sveltePreprocess = require('svelte-preprocess') // eslint-disable-line

module.exports = {
  preprocess: sveltePreprocess({
    postcss: true,
    typescript: {
      transpileOnly: true,
      compilerOptions: {
        noEmit: false,
      },
    },
  }),
}
