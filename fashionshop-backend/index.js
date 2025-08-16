console.log('this is my fashionshop');

/*
npm install pg
npm install sequelize
npm install sequelize-cli
npx sequelize-cli init
=> Mặc định ban đầu sequelize sẽ tạo với mysql, vô file config.json đổi lại dialect thành postgres

npx sequelize-cli model:generate --name User --attributes email:string,password:string,name:string,role:integer,avatar:string,phone:string,created_at:date,updated_at:date
npx sequelize-cli model:generate --name Category --attributes name:string,image:text
npx sequelize-cli model:generate --name Brand --attributes name:string,image:text
npx sequelize-cli model:generate --name News --attributes title:string,image:text,content:text
npx sequelize-cli model:generate --name Banner --attributes name:string,image:text,status:integer
npx sequelize-cli db:migrate

Revert the most recent migration:
npx sequelize-cli db:migrate:undo

Quay trở lại CSDL ban đầu trống trơn, undo all (Cẩn thận với CSDL đã có dữ liệu):
npx sequelize-cli db:migrate:undo:all
*/