# pnglatex
`pnglatex` is a small script that turns LaTeX formulas into png images. It's as simple as:

    $ pnglatex -f "E=mc^2"

If the image was created using `pnglatex` you can also reverse the process.

    $ pnglatex -r formula.png
    E=mc^2

## Installation
Download or clone the repository, then type

    # chmod +x pnglatex
    # cp pnglatex /usr/bin/pnglatex

## Dependencies
`pnglatex` depends on `dvipng`, `imagemagick`, `latex` and `optipng` packages.

    # yum -y install dvipng ImageMagick texlive texlive-latex optipng

手动下载并安装 `amsmath` 宏包（下载地址：https://www.ctan.org），然后将 `ins` 编译为 `sty` 并拷贝至 `/usr/share/texmf/tex/latex/amsmath` 目录下，然后执行 `texhash` 命令。安装完成 amsmath 宏包以后，LaTeX 可以支持 align 环境。

## Options
+ `-b <color>` Set the background color
+ `-B <color>` Set the border color
+ `-d <dpi>` Set the output resolution to the specified dpi
+ `-e <environment>` Set the environment for the formula (i.e. `displaymath` or `eqnarray`)
+ `-f <formula>` The LaTeX formula
+ `-F <color>` Set the foreground color
+ `-h` Print the help message
+ `-H <header>` Input file in header
+ `-m <margin>` Set the margin
+ `-M` Strip meta information
+ `-o <file>` Specify the output file name
+ `-O` Optimize the image
+ `-p <packages>` A colon separated list of LaTeX package names
+ `-P <padding>` Set the padding
+ `-r <file>` Read an image and print the LaTeX formula
+ `-s <size>` Set the font size
+ `-S` Don't print image file name
+ `-v` Show version
