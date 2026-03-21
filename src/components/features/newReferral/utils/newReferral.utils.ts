// UI helpers for new referral feature

export function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
  } else {
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}

export function shareReferralLink(link: string) {
  if (navigator.share) {
    navigator.share({ url: link, title: 'Join me on Vinca Wealth!' })
  } else {
    copyToClipboard(link)
    alert('Referral link copied!')
  }
}
