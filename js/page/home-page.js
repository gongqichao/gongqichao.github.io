/* global KEEP */

function homePageHandler() {
  const { post_datetime, post_datetime_format, announcement } = KEEP.theme_config?.home || {}
  const fsc = KEEP.theme_config?.first_screen || {}

  // reset home post update datetime
  const resetHomePostUpdateDate = () => {
    if (post_datetime === 'updated' && post_datetime_format) {
      const datetimeDoms = document.querySelectorAll('.post-meta-info .home-post-history')
      datetimeDoms.forEach((datetimeDom) => {
        const updated = new Date(datetimeDom.dataset.updated).getTime()
        const format = post_datetime_format || KEEP.themeInfo.defaultDatetimeFormat
        datetimeDom.innerHTML = KEEP.utils.formatDatetime(format, updated)
      })
    }
  }

  // set how long age in home post block
  const setHowLongAgoInHome = () => {
    if (post_datetime_format && post_datetime_format !== 'ago') {
      return
    }
    const datetimeDoms = document.querySelectorAll('.post-meta-info .home-post-history')
    datetimeDoms.forEach((v) => {
      const nowTimestamp = Date.now()
      const updatedTimestamp = new Date(v.dataset.updated).getTime()
      v.innerHTML = KEEP.utils.getHowLongAgo(Math.floor((nowTimestamp - updatedTimestamp) / 1000))
    })
  }

  // close website announcement
  const closeWebsiteAnnouncement = () => {
    if (announcement) {
      const waDom = document.querySelector('.home-content-container .website-announcement')
      if (waDom) {
        const closeDom = waDom.querySelector('.close')
        closeDom.addEventListener('click', () => {
          waDom.style.display = 'none'
        })
      }
    }
  }

  // first screen typewriter
  const initTypewriter = () => {
    const isHitokoto = fsc?.hitokoto === true

    if (fsc?.enable !== true) {
      return
    }

    if (fsc?.enable === true && !isHitokoto && !fsc?.description) {
      return
    }

    const descBox = document.querySelector('.first-screen-content .description')
    if (descBox) {
      descBox.style.opacity = '0'

      setTimeout(
        () => {
          descBox.style.opacity = '1'
          const descItemList = descBox.querySelectorAll('.desc-item')
          descItemList.forEach((descItem) => {
            const desc = descItem.querySelector('.desc')
            const cursor = descItem.querySelector('.cursor')
            const text = desc.innerHTML
            desc.innerHTML = ''
            let charIndex = 0

            if (text) {
              const typewriter = () => {
                if (charIndex < text.length) {
                  desc.textContent += text.charAt(charIndex)
                  charIndex++
                  setTimeout(typewriter, 100)
                } else {
                  cursor.style.display = 'none'
                }
              }

              typewriter()
            }
          })
        },
        isHitokoto ? 400 : 300
      )
    }
  }

  resetHomePostUpdateDate()
  setHowLongAgoInHome()
  closeWebsiteAnnouncement()
  initTypewriter()
  initImageGrid()
}

let __imageGridMaskReady = false

function initImageGrid() {
  const cells = document.querySelectorAll('.post-image-grid .grid-cell')
  if (!cells.length) {
    return
  }

  let mask = document.querySelector('.image-grid-mask')
  if (!mask) {
    mask = document.createElement('div')
    mask.className = 'image-grid-mask'
    mask.innerHTML =
      '<span class="grid-mask-btn grid-mask-close">&times;</span>' +
      '<span class="grid-mask-btn grid-mask-prev">&lsaquo;</span>' +
      '<img class="grid-mask-img" alt="">' +
      '<span class="grid-mask-btn grid-mask-next">&rsaquo;</span>'
    document.body.appendChild(mask)
  }

  const maskImg = mask.querySelector('.grid-mask-img')
  const state = mask.__gridState || (mask.__gridState = { list: [], idx: 0 })

  const showAt = (idx) => {
    if (!state.list.length) {
      return
    }
    state.idx = (idx + state.list.length) % state.list.length
    maskImg.src = state.list[state.idx]
    mask.classList.add('show')
    document.body.style.overflow = 'hidden'
  }

  const closeMask = () => {
    mask.classList.remove('show')
    document.body.style.overflow = ''
    maskImg.src = ''
  }

  const prevImg = () => showAt(state.idx - 1)
  const nextImg = () => showAt(state.idx + 1)

  cells.forEach((cell) => {
    if (cell.__gridBound) {
      return
    }
    cell.__gridBound = true
    cell.addEventListener('click', () => {
      const grid = cell.closest('.post-image-grid')
      if (!grid) {
        return
      }
      const cellList = Array.from(grid.querySelectorAll('.grid-cell'))
      state.list = cellList.map((c) => c.dataset.src).filter(Boolean)
      const idx = cellList.indexOf(cell)
      showAt(idx)
    })
  })

  if (!__imageGridMaskReady) {
    __imageGridMaskReady = true
    mask.querySelector('.grid-mask-close').addEventListener('click', closeMask)
    mask.querySelector('.grid-mask-prev').addEventListener('click', prevImg)
    mask.querySelector('.grid-mask-next').addEventListener('click', nextImg)
    mask.addEventListener('click', (e) => {
      if (e.target === mask) {
        closeMask()
      }
    })
    document.addEventListener('keydown', (e) => {
      if (!mask.classList.contains('show')) {
        return
      }
      if (e.key === 'Escape') {
        closeMask()
      } else if (e.key === 'ArrowLeft') {
        prevImg()
      } else if (e.key === 'ArrowRight') {
        nextImg()
      }
    })
  }
}

if (KEEP.theme_config?.pjax?.enable === true && KEEP.utils) {
  homePageHandler()
} else {
  window.addEventListener('DOMContentLoaded', homePageHandler)
}
