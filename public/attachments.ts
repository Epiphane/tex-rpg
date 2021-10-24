class Attachment {
   text: string;

   constructor(text: string) {
      this.text = text;
   }
}

export class AInfo extends Attachment { }
export class AGood extends Attachment { }
export class ASmall extends Attachment { }
export class AError extends Attachment { }