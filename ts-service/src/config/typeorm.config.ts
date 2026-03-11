import 'dotenv/config';
import { DataSource } from 'typeorm';

import { getTypeOrmOptions } from './typeorm.options';

const dataSource = new DataSource(getTypeOrmOptions());

export default dataSource;
