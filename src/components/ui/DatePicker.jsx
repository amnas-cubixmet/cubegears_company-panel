import React from 'react';
import { Calendar } from 'lucide-react';
import { Input } from './Input';

export const DatePicker = (props) => <Input type="date" icon={Calendar} {...props} />;
