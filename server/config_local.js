const configs = {
  serverHost: 'localhost',
  tunnelServerUrl: '',
  tunnelSignatureKey: '27fb7d1c161b7ca52d73cce0f1d833f9f5b5ec89',
  // 腾讯云相关配置可以查看云 API 秘钥控制台：https://console.cloud.tencent.com/capi
  qcloudAppId: '1252644202',
  qcloudSecretId: 'AKIDKcGm6EB142vfGkvjNrPsBVk3EF8PbX1R',
  qcloudSecretKey: 'PcgbN6GKDxMk3B7sSadXIyeDA4pWVO6t',
  port: '5757',
  rootPathname: '',
  appId: 'wxa01c657814b80e65',
  appSecret: '381528546bddfa148164a5c31e5f0a71',
  useQcloudLogin: true,
  mysql: {
    host: 'localhost', // local
    port: 3306,
    user: 'root',
    db: 'cAuth',
    pass: 'itdreamer', // local
    char: 'utf8mb4'
  },
  coredb: {
    host: 'gz-cdb-hy2472r9.sql.tencentcdb.com', // internet ip
    port: 63055,
    user: 'root',
    db: 'xmzy_core_db',
    pass: '2017&xmzy',
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
