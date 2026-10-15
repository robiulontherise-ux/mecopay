const fs = require('fs');

let c = fs.readFileSync('src/components/DeveloperDocs.tsx', 'utf8');

// Update laravelFullController
c = c.replace(
  /\$courierCharge = \(float\) \$request->input\('courier_charge', 120\);/g,
  '// কুরিয়ার চার্জ ডাইনামিকালি রিকোয়েস্ট বা প্রোডাক্ট থেকে নিন (ফ্রি ডেলিভারি হলে ০ থাকবে):\n        $courierCharge = (float) $request->input(\'courier_charge\', 0);'
);

c = c.replace(
  /\$advanceAmount = \(float\) \$request->input\('advance_amount', 150\);/g,
  '// ক্লায়েন্টের প্রোডাক্ট/স্টোর থেকে ডাইনামিক অগ্রিম ফি (০ হলে ১০০% ফুল ক্যাশ অন ডেলিভারি):\n            $advanceAmount = (float) $request->input(\'advance_amount\', 0);'
);

c = c.replace(
  /\$price = \(float\) \(\$_POST\['price'\] \?\? 1500\);/g,
  '// প্রোডাক্টের আসল মূল্য ও কুরিয়ার চার্জ ফর্ম বা ডাটাবেজ থেকে ডাইনামিকালি নিন:\n    $price = (float) ($_POST[\'price\'] ?? 0);'
);

c = c.replace(
  /\$courierCharge = \(float\) \(\$_POST\['courier_charge'\] \?\? 120\);/g,
  '$courierCharge = (float) ($_POST[\'courier_charge\'] ?? 0); // ফ্রি ডেলিভারি হলে ০'
);

c = c.replace(
  /\$advance = \(float\) \(\$_POST\['advance_amount'\] \?\? 150\);/g,
  '$advance = (float) ($_POST[\'advance_amount\'] ?? 0); // ০ হলে ১০০% ফুল COD'
);

c = c.replace(
  /"callback_url"     => "https:\/\/yourwebsite\.com\/payment_success\.php",\n        "cancel_url"       => "https:\/\/yourwebsite\.com\/checkout\.php"/g,
  '// সাইটের অটো ডোমেন ও ডাইনামিক পাথ:\n        "callback_url"     => ((!empty($_SERVER[\'HTTPS\']) && $_SERVER[\'HTTPS\'] !== \'off\') ? "https://" : "http://") . $_SERVER[\'HTTP_HOST\'] . "/payment_success.php",\n        "cancel_url"       => ((!empty($_SERVER[\'HTTPS\']) && $_SERVER[\'HTTPS\'] !== \'off\') ? "https://" : "http://") . $_SERVER[\'HTTP_HOST\'] . "/cart.php"'
);

c = c.replace(
  /header\("Location: https:\/\/yourwebsite\.com\/order_success\.php\?inv=" \. \$result\['invoice_number'\]\);/g,
  'header("Location: " . $result[\'checkout_url\']);'
);

fs.writeFileSync('src/components/DeveloperDocs.tsx', c);
console.log('clean_controllers.cjs executed successfully!');
