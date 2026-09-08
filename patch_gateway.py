import os

with open('src/components/DashboardShell.tsx', 'r') as f:
    content = f.read()

start_str = "if (activeSubMenu === 'Gateway Settings') {"
end_str = "if (activeSubMenu === 'Plugins & Apps') {"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    replacement = """if (activeSubMenu === 'Gateway Settings') {
      return <GatewaySettings brands={brands} />;
    }

    if (activeSubMenu === 'Payment Links') {
      return <PaymentLinks brands={brands} />;
    }

    """
    new_content = content[:start_idx] + replacement + content[end_idx:]
    with open('src/components/DashboardShell.tsx', 'w') as f:
        f.write(new_content)
    print("Patched successfully!")
else:
    print("Could not find blocks.")
