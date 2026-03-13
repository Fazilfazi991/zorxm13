<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'Zorx');

/** MySQL database username */
define('DB_USER', 'root');

/** MySQL database password */
define('DB_PASSWORD', '');

/** MySQL hostname */
define('DB_HOST', 'localhost:3307');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY', '`-gB|IiG0c$42>j`~s2$p@gpnBcQTn*lHS {,NEnI<$qk=d|zvs}n,o.Q^03$I<|');
define('SECURE_AUTH_KEY', '!{k24!YC,nG-vmY,rN*//< @-ldT>JkP;nfB)+TbYGf?|8/nzWU}@+UPsU2p;QsW');
define('LOGGED_IN_KEY', 'kQ! -q]Vciu}7DcQ?~ ub|&7M~e*B/eq`b?nxK{GA+Xie+U57/`G|^kp}5_Vz,i4');
define('NONCE_KEY', 'MB>0{6UqU97$2Lm<b0Qm+&,K{Ho/G1f$DA(+BP?-]83],1`dwgt7.JrOIg,0 !OP');
define('AUTH_SALT', 'Nvmor4WkB-T`sz)>X%Dz:~cDb@Wjx43=A~qj`9SM$rWB}kZyQvyL):qJHN#nBO5H');
define('SECURE_AUTH_SALT', '$A:z &mU06+;R>-2-KU5{(G-?q}V{CQ.Nt]>vC#v{!RE~J{y+fqk3$+>.**yYaDH');
define('LOGGED_IN_SALT', ')$1oH7h&BfTQa4(MSrs&Z)DVG%f&`|z9{ipMx#2qF~ult|5+3PO;/Uum(zUHlacP');
define('NONCE_SALT', ' dmew:h3xj`T&?s/!)Ko3Y^2BL$io4*Xp6KiIoFe&&U=9<s>L:!68XTZERwqDPV#');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if (!defined('ABSPATH')) {
	define('ABSPATH', __DIR__ . '/');
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
