awk '
  /<input type="text"/ {
    input_line = $0;
    getline label1;
    getline label2;
    getline label3;
    print label1;
    print label2;
    print label3;
    print input_line;
    next;
  }
  { print $0 }
' src/components/DashboardShell.tsx > temp.tsx && mv temp.tsx src/components/DashboardShell.tsx
