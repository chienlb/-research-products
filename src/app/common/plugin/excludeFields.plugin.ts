import { Schema } from 'mongoose';

export const excludeFieldsPlugin = (schema: Schema) => {
  schema.set('toJSON', {
    transform: (doc, ret: any, options) => { 
      if (ret) {
        delete ret.score;         
        delete ret.password;         
        delete ret.refCode;         
        delete ret.updatedBy;         
        delete ret.streakDays;    
        delete ret.createdBy;     
        delete ret.updatedBy;     
        delete ret.__v;          
        delete ret.createdAt;     
        delete ret.updatedAt;     
        delete ret.revokedAt;     
        delete ret.note;     
        delete ret.description;     
        delete ret.resolvedAt;     
      }

      return ret;
    },
  });
};
