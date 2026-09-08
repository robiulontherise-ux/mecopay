const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf-8');

const regex = /<div className="flex gap-4 relative z-0">[\s\S]*?<div className="text-\[11px\] text-slate-800 font-bold mt-1">ক্যাশ আউট<\/div>\s*<\/div>\s*<\/div>/;

const replacement = `<div className="flex justify-center w-full relative z-0">
                          {providerKey === 'bkash' && <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg1Tw9dfxPctZwX9LOuFg5yExUqViag8F1Ph7QATUh7OVDemgQACfCcSgXsvLGyYaD3aDycv5bT3yWdpS5aZCo8fDdeh-aNMyHrqG7TU1-rpttKI_WbvTtJ_UJrYn7BY-u8ElhiRYc2fdfv6vVZpouNh8UMJcoCmqMKlUtr9EQoPqnK3z-3aQDnXXr2jK9h/s572/shapeshifter-rounded-Bkash.png" alt="bKash Instructions" className="w-full max-w-[280px] h-auto object-contain" referrerPolicy="no-referrer" />}
                          {providerKey === 'nagad' && <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjUwbf9HFJVC2zmZUWg4OkhkUHgfXepJougWsb2dtJ4h4HkrT7MUTNw3v-OqKDS9lc3FlhS5dGY0_hKMwPMnfQSXz548WsG4TmokqNQc-dqtufGxtNshrQhyLyVQjP7WmA9OArl3w3vlyqiXPb2g7UhjPdq4FUEpjCTUN7BCEyG714wZSOE5BaDAtSxi8TG/s515/shapeshifter-rounded-Nagad.png" alt="Nagad Instructions" className="w-full max-w-[280px] h-auto object-contain" referrerPolicy="no-referrer" />}
                          {providerKey === 'upay' && <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGvC7gqmh8fZC-AksD6OfmPVcODE8xNB4-tKsBQrV-dUuVt8g0A4bhmGtlWSr4gkqbnxhm0tWFHY06jt4qJbiC1JxhMly97t60riM9mzyzjHAF9DuFHjqY5KCv82RDGWppwtFoK4PjMi47J-xtcVU7EinturN3AQgl8hFS0_yxQU-0h0F8c_j7HkKRumPd/s528/shapeshifter-rounded-Upay.png" alt="Upay Instructions" className="w-full max-w-[280px] h-auto object-contain" referrerPolicy="no-referrer" />}
                          {providerKey === 'rocket' && <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh8M0ggnW_3Z62G5tW8MSN12VhY4d4nqDkiQn9VHFTaA2fQD61oUcE05P9AniTyt0M0NGu69emxqFDYTDhUBuutxemodtdobgHATs8O3WwcU12unz5ddlWa2Exef-8k1BATADHwQImR2z4nvh7cfrwZ7MEhxGebCS3htoCH5HoGuNTgOO37yDhY1d5URFY1/s523/shapeshifter-rounded-Rocket.png" alt="Rocket Instructions" className="w-full max-w-[280px] h-auto object-contain" referrerPolicy="no-referrer" />}
                        </div>`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
  console.log("Patched successfully!");
} else {
  console.log("Regex didn't match.");
}
