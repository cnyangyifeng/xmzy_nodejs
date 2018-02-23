const configs = {
  port: '5757',
  rootPathname: '',
  appId: 'wxa01c657814b80e65',
  appSecret: '381528546bddfa148164a5c31e5f0a71',
  useQcloudLogin: true,
  mysql: {
    host: 'localhost', // prod
    port: 3306,
    user: 'root',
    db: 'cAuth',
    coredb: 'xmzy_core_db',
    pass: 'dbdlX3yt', // prod
    char: 'utf8mb4'
  },
  cos: {
    region: 'ap-guangzhou',
    fileBucket: 'xmzy',
    uploadFolder: ''
  },
  // 微信登录态有效期
  wxLoginExpires: 7200,
  wxMessageToken: 'xmzy'
}

module.exports = configs
