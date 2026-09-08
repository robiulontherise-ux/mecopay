const fs = require('fs');
let file = 'src/components/checkout/CheckoutPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gateway Specific Body for Steps 4 & 5 */}`;

const replacementStr = `                  </div>
                </div>
              )}
            </div>
            </>
          )}

          {/* Gateway Specific Body for Steps 4 & 5 */}`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(file, content);
