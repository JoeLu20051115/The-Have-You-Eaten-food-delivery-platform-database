**Title:** SmartEats: A Comprehensive Food Delivery Platform Database System

**Abstract:**
We designed and implemented SmartEats, a full-stack database application for modern food delivery businesses, and exposed it through an interactive web platform. The system is centered around four core modules — consumer management, merchants and menus, order center, and delivery network — forming a cohesive relational data architecture. During the database design process, we started from the conceptual E-R model, systematically converted it into a relational model, and reasonably decomposed and constrained weak entities and many-to-many relationships. We then verified each relation against BCNF/3NF via functional dependency analysis to ensure high data consistency, integrity, and low redundancy. Building on this foundation, the system further implemented SQL queries for daily operations and data analysis, and proposed index optimization and security-related data processing strategies for frequently accessed fields, thereby enhancing overall query efficiency and system scalability.

At the application level, SmartEats offers a web system that integrates data query, business management, and intelligent interaction, allowing users to perform database operations and obtain information without directly writing SQL. The system supports multi-table data browsing, keyword search, condition filtering, sorting, and pagination, while administrators have access to full create, update, and delete capabilities. Key business indicators, order status, delivery status, and analytical results are presented through visual dashboard pages. To further enhance usability and intelligence, we introduced an **AI assistant powered by a large language model** on the web frontend for natural language question answering and automated read-only SQL query generation, enabling users to access platform data in a more intuitive way. In terms of **security and privacy**, the system adopts a role-based access control mechanism to isolate the permissions of administrators and read-only users, ensuring that sensitive operations are only accessible to authorized roles. At the same time, user passwords are encrypted for storage, and the direct exposure of sensitive fields is minimized during front-end and back-end interactions to strengthen account security and privacy protection. Overall, SmartEats demonstrates the comprehensive application value of database theory, web application development, and intelligent question-answering technology in real food delivery scenarios.

**Members:**

陆恩乔 124090411

麻华景程 124090462

吴希睿 124090689

国晟滔 124090158

孟悦喆 124090475

钟兆丰 124090937

潘泓兴 124090486

陈桢涛 124090064
