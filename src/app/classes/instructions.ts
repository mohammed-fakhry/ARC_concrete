export class Instructions {
  header: string = '';
  contents: {
    id: string;
    mainTitle: string;
    mainPic: string;
    body: { title: string; pic: string, class: string }[];
  }[] = [];
}
