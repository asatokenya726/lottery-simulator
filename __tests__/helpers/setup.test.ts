/**
 * セットアップファイルの動作確認用スモークテスト
 * テスト基盤が正しく動作することを検証する
 */
describe('テスト基盤', () => {
  it('Vitestが正しく動作すること', () => {
    expect(true).toBe(true)
  })

  it('jest-domのマッチャーが利用可能であること', () => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    expect(element).toBeInTheDocument()
    document.body.removeChild(element)
  })
})
