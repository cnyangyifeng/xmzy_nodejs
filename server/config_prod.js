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
    pass: 'dbdlX3yt', // prod
    char: 'utf8mb4'
  },
  coredb: {
    host: 'gz-cdb-hy2472r9.sql.tencentcdb.com', // internet ip
    port: 63055,
    user: 'weapp_xmzy',
    db: 'xmzy_core_db',
    pass: '2018^xmzy',
    char: 'utf8mb4'
  },
  cos: {
    region: 'ap-guangzhou',
    fileBucket: 'xmzy',
    uploadFolder: 'user_data'
  },
  // 微信登录态有效期
  wxLoginExpires: 7200,
  wxMessageToken: 'xmzy'
}

module.exports = configs
