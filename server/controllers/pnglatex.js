const util = require('util');
const exec = util.promisify(require('child_process').exec);
const formulaUploader = require('../services/formulaUploader')

/* ================================================================================ */

async function parseFormula(ctx, next) {
  const formula = ctx.request.query['formula']
  console.log(`[pngLaTeX] formula => ${formula}`)
  // pnglatex
  //   -b <color> Set the background color
  //   -B <color> Set the border color
  //   -d <dpi> Set the output resolution to the specified dpi
  //   -e <environment> Set the environment for the formula (i.e. displaymath or eqnarray)
  //   -f <formula> The LaTeX formula
  //   -F <color> Set the foreground color
  //   -h Print the help message
  //   -H <header> Input file in header
  //   -m <margin> Set the margin
  //   -M Strip meta information
  //   -o <file> Specify the output file name
  //   -O Optimize the image
  //   -p <packages> A colon separated list of LaTeX package names
  //   -P <padding> Set the padding
  //   -r <file> Read an image and print the LaTeX formula
  //   -s <size> Set the font size
  //   -S Don't print image file name
  //   -v Show version
  const cmd = `pnglatex -p amsmath -e align* -d 160 -m 40 -O -f "${formula}"`
  const { stdout, stderr } = await exec(cmd)
  if (stderr) {
    console.log(`[pngLaTeX] stderr => ${stderr}`)
  }
  if (stdout) {
    const formulaImagePath = stdout.trim()
    console.log(`[pngLaTeX] stdout => ${formulaImagePath}`)
    ctx.state.data = await formulaUploader(formulaImagePath)
  }
}

/* ================================================================================ */

module.exports = {
  parseFormula
}