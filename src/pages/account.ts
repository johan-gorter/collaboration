import {createPage} from '../components/page/page';
import {createText} from '../components/text/text';
import {createTextField} from '../components/text-field/text-field';
import {createButton} from '../components/button/button';
import {createImageUploader} from '../components/image-uploader/image-uploader';
import {UserService} from '../services/user-service';
import {DataService} from '../services/data-service';

export let createAccountPage = (dataService: DataService, userService: UserService) => {

  let {id, firstName, lastName, phoneNumber, imageUrl, company} = userService.getUserInfo();

  let doUpdate = () => {
    userService.updateUserInfo({
      id,
      firstName,
      lastName,
      phoneNumber,
      company,
      imageUrl
    });
    document.location.hash = '#users';
  };

  let page = createPage({
    title: 'Account',
    dataService,
    body: [
      createText({ htmlContent: 'About me' }),
      createTextField({ label: 'First name' }, { getValue: () => firstName, setValue: (value) => { firstName = value; } }),
      createTextField({ label: 'Last name' }, { getValue: () => lastName, setValue: (value) => { lastName = value; } }),
      createTextField({ label: 'phone number' }, { getValue: () => phoneNumber, setValue: (value) => { phoneNumber = value; } }),
      createTextField({ label: 'Company' }, { getValue: () => company, setValue: (value) => { company = value; } }),
      createTextField({ label: 'profile picture URL' }, { getValue: () => imageUrl, setValue: (value) => { imageUrl = value; } }),
      createImageUploader(),
      createButton({ text: 'Update', primary: true }, { onClick: doUpdate })
    ]
  });
  return page;
};
