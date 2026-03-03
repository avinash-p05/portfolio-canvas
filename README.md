# Avinash Pauskar — Terminal Portfolio

A terminal-style portfolio website built with vanilla HTML, CSS & JavaScript. No frameworks, no dependencies — just a single `index.html`.

## Live

**[avinash-pauskar-portfolio.netlify.app](https://avinash-pauskar-portfolio.netlify.app)**

## Features

- Realistic terminal UI with CRT scanline effect
- 20+ commands including `neofetch`, `whoami`, `ls`, `cat`, `tree`, `pip list`, `cowsay`, `fortune`, and more
- Tab auto-completion & command history (↑/↓)
- Boot-up animation sequence
- Fully responsive for mobile
- Zero dependencies — deploys anywhere

## Commands

| Category | Commands |
|----------|---------|
| Portfolio | `about`, `education`, `experience`, `projects`, `skills`, `achievements`, `contact`, `social`, `all` |
| Terminal | `neofetch`, `whoami`, `hostname`, `uname -a`, `pwd`, `ls`, `tree`, `cat <file>`, `date`, `uptime`, `history`, `echo <msg>` |
| Packages | `pip list`, `npm list`, `apt list`, `brew list` |
| Git | `git status`, `git log` |
| Docker | `docker ps` |
| Fun | `cowsay <msg>`, `fortune`, `top`, `wget resume`, `sudo`, `rm -rf /` |
| Misc | `clear`, `banner`, `man <cmd>`, `exit` |

## Deploy

Just drop the folder on [Netlify](https://netlify.com), [Vercel](https://vercel.com), or any static host. No build step needed.

```bash
# Or use Netlify CLI
netlify deploy --dir . --prod
```

## License

MIT
