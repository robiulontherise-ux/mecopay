const fs = require('fs');
let file = 'src/components/checkout/CheckoutPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the bad `</>` from the end of the Body (line 892)
const badBodyEndStr = `                  </div>
                </div>
              )}
            </div>
            </>
          )}

          {/* Gateway Specific Body for Steps 4 & 5 */}`;

const goodBodyEndStr = `                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gateway Specific Body for Steps 4 & 5 */}`;

content = content.replace(badBodyEndStr, goodBodyEndStr);

// 2. Add the `</>` at the end of the Header (line 757)
// Let's find what's right before it
const headerEndStr = `                 </div>
              )}
            </div>
          )}

          {/* Standard Body Content */}`;

const headerEndNewStr = `                 </div>
              )}
            </div>
            </>
          )}

          {/* Standard Body Content */}`;

content = content.replace(headerEndStr, headerEndNewStr);

fs.writeFileSync(file, content);
