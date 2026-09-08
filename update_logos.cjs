const fs = require('fs');
let content = fs.readFileSync('src/components/payment-hub/GatewaySettings.tsx', 'utf-8');

content = content.replace(
  /'https:\/\/raw.githubusercontent.com\/helloanaroul\/bd-mfs-logos\/main\/logos\/png\/nagad.png'/g,
  '"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjUwbf9HFJVC2zmZUWg4OkhkUHgfXepJougWsb2dtJ4h4HkrT7MUTNw3v-OqKDS9lc3FlhS5dGY0_hKMwPMnfQSXz548WsG4TmokqNQc-dqtufGxtNshrQhyLyVQjP7WmA9OArl3w3vlyqiXPb2g7UhjPdq4FUEpjCTUN7BCEyG714wZSOE5BaDAtSxi8TG/s515/shapeshifter-rounded-Nagad.png"'
);

content = content.replace(
  /'https:\/\/raw.githubusercontent.com\/helloanaroul\/bd-mfs-logos\/main\/logos\/png\/upay.png'/g,
  '"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGvC7gqmh8fZC-AksD6OfmPVcODE8xNB4-tKsBQrV-dUuVt8g0A4bhmGtlWSr4gkqbnxhm0tWFHY06jt4qJbiC1JxhMly97t60riM9mzyzjHAF9DuFHjqY5KCv82RDGWppwtFoK4PjMi47J-xtcVU7EinturN3AQgl8hFS0_yxQU-0h0F8c_j7HkKRumPd/s528/shapeshifter-rounded-Upay.png"'
);

content = content.replace(
  /'https:\/\/raw.githubusercontent.com\/helloanaroul\/bd-mfs-logos\/main\/logos\/png\/rocket.png'/g,
  '"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh8M0ggnW_3Z62G5tW8MSN12VhY4d4nqDkiQn9VHFTaA2fQD61oUcE05P9AniTyt0M0NGu69emxqFDYTDhUBuutxemodtdobgHATs8O3WwcU12unz5ddlWa2Exef-8k1BATADHwQImR2z4nvh7cfrwZ7MEhxGebCS3htoCH5HoGuNTgOO37yDhY1d5URFY1/s523/shapeshifter-rounded-Rocket.png"'
);

fs.writeFileSync('src/components/payment-hub/GatewaySettings.tsx', content);
console.log('Logos updated in GatewaySettings.tsx');
